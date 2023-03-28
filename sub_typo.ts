import { videoBatch } from './lib/video_batch'
import { mustBeExist } from './lib/fs'
import { f } from './lib/filename'
import { modifySubtitle, assToSrt, srtToAss, transformTypoSrt } from './lib/subtitle'
import type { CliOptions } from './lib/types'

export function runSubTypo(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 6,
    onStart() {

      mustBeExist('dist-ass')

    },
    async handle({ file }) {

      await assToSrt(`${f(file).nameAppend('-original').ext('ass')}`)
      await modifySubtitle(`${f(file).nameAppend('-original').ext('srt')}`, transformTypoSrt)
      await srtToAss(`${f(file).nameAppend('-original').ext('srt')}`, `../dist/${file}`)

    }
  })
}
