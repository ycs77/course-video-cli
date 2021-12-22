import video_batch from './video_batch'
import { dirMustBeExist, mkdir, rmdir } from './dir'

video_batch({
  onStart() {

    dirMustBeExist('dist-srt')

    mkdir('dist-ass')

  },
  handle({ file, file_ext, exec }) {

    rmdir(`dist-ass/${file_ext(file, '.ass')}`)

    exec(`ffmpeg -i dist-srt/${file_ext(file, '.srt')} dist-ass/${file_ext(file, '.ass')}`)

  },
})
