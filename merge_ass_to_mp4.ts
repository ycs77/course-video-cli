import video_batch from './video_batch'
import { dirMustBeExist, mkdir, rmdir } from './dir'

video_batch({
  onStart() {

    dirMustBeExist('dist-ass')

    mkdir('dist-v-ass')

  },
  handle({ file, file_ext, exec }) {

    rmdir(`dist-v-ass/${file}`)

    exec(`ffmpeg -i ${file} -vf "ass=dist-ass/${file_ext(file, '.ass')}" dist-v-ass/${file}`)

  }
})
