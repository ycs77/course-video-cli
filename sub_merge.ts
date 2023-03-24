import { videoBatch } from './lib/video_batch'
import { mustBeExist, mkdir, rm } from './lib/fs'
import { f } from './lib/filename'
import { exec } from './lib/process'
import type { CliOptions } from './lib/types'

export function runSubMerge(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 6,
    onStart() {

      mustBeExist('dist-ass')

      mkdir('dist-v-ass')

    },
    async handle({ file }) {

      rm(`dist-v-ass/${file}`)

      await exec('ffmpeg', [
        '-i', `dist/${file}`,
        '-vf', `ass=dist-ass/${f(file).ext('ass')}`,
        `dist-v-ass/${file}`,
      ])

    }
  })
}
