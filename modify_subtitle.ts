import { video_batch } from './lib/video_batch'
import { mustBeExist } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, moveSubtitleTime } from './lib/subtitle'

video_batch({
  maxConcurrent: 6,
  onStart() {

    mustBeExist('dist-ass')

  },
  async handle({ file }) {

    // 移動時間軸
    await modifySubtitle(
      `${f(file).nameAppend('-original').ext('ass')}`,
      stream => moveSubtitleTime(-300, stream)
    )

  }
})
