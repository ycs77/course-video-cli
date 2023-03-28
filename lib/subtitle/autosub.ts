import fs from 'fs'
import Bottleneck from 'bottleneck'
import { resync, parse, stringify } from 'subtitle'
import { copy, rm, rename } from '../fs'
import { f } from '../filename'
import { encoder } from '../encode'
import { getDuration } from '../duration'
import { exec } from '../process'
import { modifySubtitle } from './utils'
import type { Subtitle } from './types'
import type { LogPrinter } from '../debug'

export interface AutosubOptions {
  file: string
  log: LogPrinter
}

export class Autosub implements Subtitle {
  file: string
  log: LogPrinter

  constructor(options: AutosubOptions) {
    this.file = options.file
    this.log = options.log
  }

  async transcribe() {
    rm(`dist-ass/${f(this.file).ext('ass').nameAppend('.zh-tw')}`)

    // 常數
    const chunkSize = 30 // MB

    // base64 encoder
    const { encode } = encoder({
      encodeFormat: str => `${str}TEMP`,
    })

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
      // base64 編譯檔名
      const encoded = f(file).name(encode)
      copy(`${distDir}/${file}`, `${distDir}/${encoded}`)

      // 上傳 mp3 / mp4
      const cmd = './cli/autosub/autosub/autosub'
      const args = [
        '-i', `${distDir}/${encoded}`,
        '--speech-language', 'zh-TW',
        '--output', 'dist-ass',
        '--format', 'srt',
        '--yes',
      ]
      this.log(`${mediaExt} cmd`, cmd + args.join(' '))
      await exec(cmd, args)

      // 刪除暫存檔
      rm(`${distDir}/${encoded}`)

      // 將 base64 編譯檔名改回來
      const srtTemp = `dist-ass/${encoded.clone().nameAppend('.zh-tw').ext('srt')}`
      const srtOutput = `dist-ass/${f(file).ext('srt')}`
      this.log('srt temp', srtTemp)
      this.log('srt output', srtOutput)
      rename(srtTemp, srtOutput)
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
              .pipe(resync(start * 1000)) // 毫秒
              .pipe(stringify({ format: 'SRT' }))
              .on('data', chunk => chunks.push(Buffer.from(chunk)))
              .on('end', () => {
                const content = Buffer.concat(chunks).toString('utf-8')
                resolve(content)
              })
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

