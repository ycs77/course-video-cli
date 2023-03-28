import fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'
import Bottleneck from 'bottleneck'
import { map, resync, parse, stringify } from 'subtitle'
import { rm } from '../fs'
import { f } from '../filename'
import { getDuration } from '../duration'
import { exec } from '../process'
import { modifySubtitle } from './utils'
import type { Subtitle } from './types'
import type { LogPrinter } from '../debug'

export interface WhisperOptions {
  file: string
  log: LogPrinter
  prompt?: string
}

export class Whisper implements Subtitle {
  file: string
  log: LogPrinter
  prompt?: string

  constructor(options: WhisperOptions) {
    this.file = options.file
    this.log = options.log
    this.prompt = options.prompt
  }

  async transcribe() {
    // 常數
    const chunkSize = 24 // MB

    // 初始化
    const openAiConfig = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      baseOptions: {
        // Using Infinity is to fix ERR_FR_MAX_BODY_LENGTH_EXCEEDED error
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    })
    const openai = new OpenAIApi(openAiConfig)
    const prompt = this.prompt || '請使用繁體中文'

    // 檔名路徑
    const mp3IsExists = fs.existsSync(`dist-mp3/${f(this.file).ext('mp3')}`)
    const distDir = mp3IsExists ? 'dist-mp3' : 'dist'
    const mediaExt = mp3IsExists ? 'mp3' : 'mp4'
    const mediaFile = `${f(this.file).ext(mediaExt)}`
    const mediaPath = `${distDir}/${mediaFile}`

    // 計算分割媒體
    const mediaStats = fs.statSync(mediaPath)
    const mediaSize = mediaStats.size / (1024 * 1024) // MB
    const chunkCount = Math.ceil(mediaSize / chunkSize)
    const duration = await getDuration(mediaPath)
    const chunkDuration = duration * (chunkSize / mediaSize)

    // 產生字幕
    const generateSubtitle = async (file: string) => {
      // 上傳 mp3 / mp4
      const stream = fs.createReadStream(`${distDir}/${file}`)
      // @ts-expect-error
      const { data } = await openai.createTranscription(stream, 'whisper-1', prompt || undefined, 'srt')
      const srt = data as unknown as string

      // 儲存 srt 字幕
      this.log('srt output', `dist-ass/${f(file).ext('srt')}`)
      fs.writeFileSync(`dist-ass/${f(file).ext('srt')}`, srt, {
        encoding: 'utf-8',
      })
    }

    // 分割處理影片/音樂
    if (duration > chunkDuration) {
      let fullSrtContent = ''

      const limiter = new Bottleneck({ maxConcurrent: 1 })

      this.log('media chunk count', chunkCount)

      await Promise.all(
        Array.from({ length: chunkCount }).map((_, index) => limiter.schedule(async () => {
          const chunkFile = f(mediaFile).nameAppend(`_chunk_${index + 1}`)
          const chunkSrtFile = chunkFile.clone().ext('srt')
          const start = chunkDuration * index // 秒
          const realChunkDuration = Math.min(chunkDuration, duration - start)

          // 分割
          rm(`${distDir}/${chunkFile}`)
          const cmd = 'ffmpeg'
          const args = [
            '-i', `${distDir}/${mediaFile}`,
            '-ss', `${start}`,
            '-t', `${chunkDuration}`,
            `${distDir}/${chunkFile}`,
          ]
          this.log(`media chunk ${index + 1} file`, `${distDir}/${chunkFile}`)
          this.log(`media chunk ${index + 1} cmd`, cmd + args.join(' '))
          await exec(cmd, args)

          // 產生字幕
          await generateSubtitle(`${chunkFile}`)

          // 處裡分割的 srt
          const srtContent = await new Promise(resolve => {
            const chunks: Uint8Array[] = []
            fs.createReadStream(`dist-ass/${chunkSrtFile}`)
              .pipe(parse())
              .pipe(map(node => {
                if (node.type === 'cue') {
                  // fix first subtitle time
                  if (node.data.start < 0)
                    node.data.start = 0
                  // fix last subtitle time
                  if (node.data.end > (realChunkDuration * 1000)) // 毫秒
                    node.data.end = realChunkDuration * 1000
                }
                return node
              }))
              .pipe(resync(start * 1000)) // 毫秒
              .pipe(stringify({ format: 'SRT' }))
              .on('data', chunk => chunks.push(Buffer.from(chunk)))
              .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
          })

          // 加入完整 srt
          if (fullSrtContent) fullSrtContent += "\n"
          fullSrtContent += srtContent

          rm(`${distDir}/${chunkFile}`)
          rm(`dist-ass/${chunkSrtFile}`)
        }))
      )

      // 保存完整 srt
      fs.writeFileSync(`dist-ass/${f(mediaFile).ext('srt')}`, fullSrtContent, {
        encoding: 'utf-8',
      })
      await modifySubtitle(`dist-ass/${f(mediaFile).ext('srt')}`)
    } else {
      await generateSubtitle(mediaFile)
    }
  }
}
