import fs from 'fs'
import { video_batch } from './lib/video_batch'
import { mkdir, copy, rm, rename } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, moveSubtitleTime, updateASSMetadata } from './lib/subtitle'
import { encoder } from './lib/encode'

video_batch({
  maxConcurrent: 3,
  onStart() {

    mkdir('dist-ass')

  },
  async handle({ file, exec, log }) {

    rm(`dist-ass/${f(file).ext('ass')}`)
    rm(`dist-ass/${f(file).ext('ass').nameAppend('.zh-tw')}`)
    rm(`dist-ass/${f(file).ext('ass').nameAppend('-original')}`)

    const { encode } = encoder({
      encodeFormat: str => `${str}TEMP`,
    })

    let assTemp: string

    const mp3IsExists = fs.existsSync(`dist-mp3/${f(file).ext('mp3')}`)
    log('if mp3 exists', mp3IsExists)
    if (mp3IsExists) {
      // ---------- [[ 轉換 mp3 ]] ----------

      // base64 檔名
      const encodedMp3 = encode(file.replace('.mp4', '')) + '.mp3'
      copy(
        `dist-mp3/${f(file).ext('mp3')}`,
        `dist-mp3/${encodedMp3}`
      )

      // 上傳 mp3
      const cmd = `./cli/autosub/autosub/autosub -i dist-mp3/${encodedMp3} -S zh-TW -o dist-ass -F ass -y`
      log('mp3 cmd', cmd)
      await exec(cmd)

      // 刪除暫存 mp3 檔
      rm(`dist-mp3/${encodedMp3}`)

      assTemp = `dist-ass/${encodedMp3.replace('.mp3', '.zh-tw.ass')}`
    } else {
      // ---------- [[ 轉換 mp4 ]] ----------

      // base64 檔名
      const encodedMp4 = encode(file.replace('.mp4', '')) + '.mp4'
      copy(
        `dist/${file}`,
        `dist/${encodedMp4}`
      )

      // 上傳 mp4
      const cmd = `./cli/autosub/autosub/autosub -i dist/${file} -S zh-TW -o dist-ass -F ass -y`
      log('mp4 cmd', cmd)
      await exec(cmd)

      // 刪除暫存 mp4 檔
      rm(`dist/${encodedMp4}`)

      assTemp = `dist-ass/${encodedMp4.replace('.mp4', '.zh-tw.ass')}`
    }

    // 將 ass 檔名改回來
    const assOutput = `dist-ass/${f(file).ext('ass')}`
    log('ass temp', assTemp)
    log('ass output', assOutput)
    rename(assTemp, assOutput)

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
    await modifySubtitle(
      `${f(file).nameAppend('-original').ext('ass')}`,
      stream => moveSubtitleTime(-300, stream)
    )

  }
})
