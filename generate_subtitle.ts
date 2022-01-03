import fs from 'fs'
import video_batch from './lib/video_batch'
import { mkdir, rm } from './lib/fs'

video_batch({
  onStart() {

    mkdir('dist-ass')

  },
  async handle({ file, file_ext, exec }) {

    rm(`dist-ass/${file_ext(file, '.ass')}`)
    rm(`dist-ass/${file_ext(file, '.ass').replace('.ass', '.zh-tw.ass')}`)

    if (fs.existsSync(`dist-mp3/${file_ext(file, '.mp3')}`)) {
      // 上傳 mp3
      await exec(`./cli/autosub/autosub/autosub -i dist-mp3/${file_ext(file, '.mp3')} -S zh-TW -o dist-ass -F ass -y`)
    } else {
      // 上傳 mp4
      await exec(`./cli/autosub/autosub/autosub -i dist/${file} -S zh-TW -o dist-ass -F ass -y`)
    }

    fs.renameSync(
      `dist-ass/${file_ext(file, '.ass').replace('.ass', '.zh-tw.ass')}`,
      `dist-ass/${file_ext(file, '.ass')}`
    )

  }
})
