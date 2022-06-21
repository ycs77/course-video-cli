import { videoBatch } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'
import { f } from './lib/filename'
import type { CliOptions } from './lib/types'

export function runMp4ToMp3(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
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
}
