import video_batch from './lib/video_batch'
import { dirMustBeExist, mkdir, rm } from './lib/fs'

video_batch({
  onStart() {

    dirMustBeExist('dist')

    mkdir('dist-mp3')

  },
  async handle({ file, file_ext, exec }) {

    rm(`dist-mp3/${file_ext(file, '.mp3')}`)

    await exec(`ffmpeg -i dist/${file} dist-mp3/${file_ext(file, '.mp3')}`)

  },
})
