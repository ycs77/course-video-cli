import video_batch from './video_batch'
import { dirMustBeExist, mkdir, rmdir } from './dir'

video_batch({
  onStart() {

    dirMustBeExist('dist')

    mkdir('dist-mp3')

  },
  handle({ file, file_ext, exec }) {

    rmdir(`dist-mp3/${file_ext(file, '.mp3')}`)

    exec(`ffmpeg -i dist/${file} dist-mp3/${file_ext(file, '.mp3')}`)

  },
})
