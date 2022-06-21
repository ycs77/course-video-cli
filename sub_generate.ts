import fs from 'fs'
import Bottleneck from 'bottleneck'
import { resync, parse, stringify } from 'subtitle'
import { videoBatch } from './lib/video_batch'
import { mkdir, copy, rm, rename } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, srtStream, updateASSMetadata } from './lib/subtitle'
import { encoder } from './lib/encode'
import { getDuration } from './lib/duration'
import { exec } from './lib/process'
import type { CliOptions } from './lib/types'

export function runSubGenerate(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 3,
    onStart() {

      mkdir('dist-ass')

    },
    async handle({ file, log }) {

      rm(`dist-ass/${f(file).ext('ass')}`)
      rm(`dist-ass/${f(file).ext('ass').nameAppend('.zh-tw')}`)
      rm(`dist-ass/${f(file).ext('ass').nameAppend('-original')}`)

      // 常數
      const VIDEO_CHUNK_SECONDS = 30 * 60 // 30分鐘

      // 第三方
      const { encode } = encoder({
        encodeFormat: str => `${str}TEMP`,
      })

      // 變數
      const mp3IsExists = fs.existsSync(`dist-mp3/${f(file).ext('mp3')}`)
      const distDir = mp3IsExists ? 'dist-mp3' : 'dist'
      const mediaExt = mp3IsExists ? 'mp3' : 'mp4'
      const mediaFile = `${f(file).ext(mediaExt)}`
      const mediaPath = `${distDir}/${mediaFile}`

      // 產生字幕
      async function generateSubtitle(file: string) {
        // base64 編譯檔名
        const encoded = f(file).name(encode)
        copy(`${distDir}/${file}`, `${distDir}/${encoded}`)

        // 上傳 mp3 / mp4
        const cmd = `./cli/autosub/autosub/autosub -i ${distDir}/${encoded} -S zh-TW -o dist-ass -F ass -y`
        log(`${mediaExt} cmd`, cmd)
        await exec(cmd)

        // 刪除暫存檔
        rm(`${distDir}/${encoded}`)

        // 將 ass 檔名改回來
        const assTemp = `dist-ass/${encoded.clone().nameAppend('.zh-tw').ext('ass')}`
        const assOutput = `dist-ass/${f(file).ext('ass')}`
        log('ass temp', assTemp)
        log('ass output', assOutput)
        rename(assTemp, assOutput)
      }

      // 分割處理影片/音樂
      async function handleMedia(file: string, duration: number, chunkTime: number, handleSubtitle: (chunkFile: string) => Promise<void> | void) {
        if (duration > chunkTime) {
          const limiter = new Bottleneck({ maxConcurrent: 1 })
          const count = Math.ceil(duration / chunkTime)
          let fullSrtContent = ''

          await Promise.all(
            Array(count).map((_, index) => limiter.schedule(async () => {
              const chunkFile = f(file).nameAppend(`_chunk_${index + 1}`)
              const start = chunkTime * index // 秒

              // 分割
              const cmd = `ffmpeg -i ${distDir}/${file} -ss ${start} -t ${chunkTime} ${distDir}/${chunkFile}`
              log(`media chunk ${index + 1} file`, `${distDir}/${chunkFile}`)
              log(`media chunk ${index + 1} cmd`, cmd)
              await exec(cmd)

              // 產生字幕
              await handleSubtitle(`${chunkFile}`)

              // 刪除分割暫存影片/音樂
              rm(`${distDir}/${chunkFile}`)

              // ------------------------------------------------
              // 組合字幕
              const chunkASSFile = chunkFile.clone().ext('ass')
              const chunkSrtFile = chunkFile.clone().ext('srt')
              const chunkSrtOutputFile = chunkFile.clone().nameAppend('-o').ext('srt')

              rm(`dist-ass/${chunkSrtFile}`)
              await exec(`ffmpeg -i dist-ass/${chunkASSFile} -c:s text dist-ass/${chunkSrtFile}`)

              await new Promise(resolve => {
                fs.createReadStream(`dist-ass/${chunkSrtFile}`)
                  .pipe(parse())
                  .pipe(resync(start * 1000)) // 毫秒
                  .pipe(stringify({ format: 'SRT' }))
                  .pipe(fs.createWriteStream(`dist-ass/${chunkSrtOutputFile}`))
                  .on('finish', resolve)
              })

              if (fullSrtContent) fullSrtContent += "\n"
              fullSrtContent += fs.readFileSync(`dist-ass/${chunkSrtOutputFile}`, { encoding: 'utf-8' })

              rm(`dist-ass/${chunkASSFile}`)
              rm(`dist-ass/${chunkSrtFile}`)
              rm(`dist-ass/${chunkSrtOutputFile}`)
            }))
          )

          fs.writeFileSync(`dist-ass/${f(file).ext('srt')}`, fullSrtContent, { encoding: 'utf-8' })

          await exec(`ffmpeg -i dist-ass/${f(file).ext('srt')} dist-ass/${f(file).ext('ass')}`)

          rm(`dist-ass/${f(file).ext('srt')}`)
        } else {
          await handleSubtitle(file)
        }
      }

      const duration = await getDuration(mediaPath)
      await handleMedia(mediaFile, duration, VIDEO_CHUNK_SECONDS, async path => {
        await generateSubtitle(path)
      })

      // 加上 `-original` 後綴
      rename(
        `dist-ass/${f(file).ext('ass')}`,
        `dist-ass/${f(file).ext('ass').nameAppend('-original')}`
      )

      // 更新 ASS 字幕檔的 metadata
      updateASSMetadata(
        `dist-ass/${f(file).ext('ass').nameAppend('-original')}`,
        `../dist/${file}`
      )

      // 移動時間軸
      await modifySubtitle(`${f(file).nameAppend('-original').ext('ass')}`, srtStream)

    }
  })
}
