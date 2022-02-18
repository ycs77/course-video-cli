import { video_batch } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'
import { f } from './lib/filename'

video_batch({
  maxConcurrent: 6,
  onStart() {

    mustBeExist('dist-ass')

    mkdir('dist-v-ass')

  },
  async handle({ file, exec }) {

    rm(`dist-v-ass/${file}`)

    await exec(`ffmpeg -i dist/${file} -vf ass=dist-ass/${f(file).ext('ass')} dist-v-ass/${file}`)

  }
})
