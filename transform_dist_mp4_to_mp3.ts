import { video_batch, file_ext } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'

video_batch({
  maxConcurrent: 8,
  onStart() {

    mustBeExist('dist')

    mkdir('dist-mp3')

  },
  async handle({ file, exec }) {

    rm(`dist-mp3/${file_ext(file, '.mp3')}`)

    await exec(`ffmpeg -i dist/${file} dist-mp3/${file_ext(file, '.mp3')}`)

  },
})
