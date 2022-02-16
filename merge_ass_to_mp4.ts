import { video_batch, file_ext } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'

video_batch({
  maxConcurrent: 6,
  onStart() {

    mustBeExist('dist-ass')

    mkdir('dist-v-ass')

  },
  async handle({ file, exec }) {

    rm(`dist-v-ass/${file}`)

    await exec(`ffmpeg -i dist/${file} -vf ass=dist-ass/${file_ext(file, '.ass')} dist-v-ass/${file}`)

  }
})
