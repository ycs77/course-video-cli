import { videoBatch } from './lib/video_batch'
import { mustBeExist } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, srtStream } from './lib/subtitle'
import type { CliOptions } from './lib/types'

export function runSubCorrect(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 10,
    onStart() {

      mustBeExist('dist-ass')

    },
    async handle({ file }) {

      // 移動時間軸
      await modifySubtitle(`${f(file).nameAppend('-original').ext('ass')}`, srtStream)

    }
  })
}
