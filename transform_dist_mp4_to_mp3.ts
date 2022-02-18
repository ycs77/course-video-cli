import { video_batch } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'
import { f } from './lib/filename'

video_batch({
  maxConcurrent: 6,
  onStart() {

    mustBeExist('dist')

    mkdir('dist-mp3')

  },
  async handle({ file, exec }) {

    rm(`dist-mp3/${f(file).ext('mp3')}`)

    await exec(`ffmpeg -i dist/${file} dist-mp3/${f(file).ext('mp3')}`)

  },
})
