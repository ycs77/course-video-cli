import { videoBatch } from './lib/video_batch'
import { mustBeExist } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, srtStream } from './lib/subtitle'
import type { CliOptions } from './lib/types'

export function runSubCorrect(options: CliOptions) {
  videoBatch({ options }, {
    maxConcurrent: 10,
    onStart() {

      mustBeExist('dist-ass')

    },
    async handle({ file, exec }) {

      // 移動時間軸
      await modifySubtitle(`${f(file).nameAppend('-original').ext('ass')}`, {
        exec,
        handle: srtStream,
      })

    }
  })
}
