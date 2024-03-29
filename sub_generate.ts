import { videoBatch } from './lib/video_batch'
import { mkdir, rename, mustBeNotExist } from './lib/fs'
import { f } from './lib/filename'
import { createSubtitle, modifySubtitle, transformFormatSrt, transformTypoSrt, srtToAss } from './lib/subtitle'
import { SubtitleError } from './lib/error'
import type { CliOptions } from './lib/types'
import type { SubtitleDrivers } from './lib/subtitle/types'

export interface RunSubGenerateOptions extends CliOptions {
  driver: keyof SubtitleDrivers
  format: 'srt' | 'ass'
  prompt?: string
}

export function runSubGenerate(video_filter_pattern: string, options: RunSubGenerateOptions) {
  if (!['autosub', 'whisper'].includes(options.driver)) {
    throw new SubtitleError(`\`driver\` option must be contains ${['autosub', 'whisper'].join(', ')}`)
  }

  if (!['srt', 'ass'].includes(options.format)) {
    throw new SubtitleError(`\`format\` option must be contains ${['srt', 'ass'].join(', ')}`)
  }

  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 3,
    onStart() {

      mkdir('dist-ass')

    },
    async handle({ file, log }) {

      mustBeNotExist(`dist-ass/${f(file).ext('srt')}`)
      if (options.format === 'ass') {
        mustBeNotExist(`dist-ass/${f(file).ext('ass')}`)
        mustBeNotExist(`dist-ass/${f(file).ext('ass').nameAppend('-original')}`)
      } else if (options.format === 'srt') {
        mustBeNotExist(`dist-ass/${f(file).ext('srt').nameAppend('-original')}`)
      }

      // 產生字幕
      const subtitle = createSubtitle(options.driver, { file, log, prompt: options.prompt })
      await subtitle.transcribe()

      // 移動時間軸
      await modifySubtitle(`${f(file).ext('srt')}`, transformFormatSrt)
      // 校正常見錯字
      await modifySubtitle(`${f(file).ext('srt')}`, transformTypoSrt)

      if (options.format === 'ass') {

        // srt 轉 ass
        await srtToAss(`${f(file).ext('srt')}`, `../dist/${file}`)

        // 加上 `-original` 後綴
        rename(
          `dist-ass/${f(file).ext('ass')}`,
          `dist-ass/${f(file).ext('ass').nameAppend('-original')}`
        )

      } else if (options.format === 'srt') {

        // 加上 `-original` 後綴
        rename(
          `dist-ass/${f(file).ext('srt')}`,
          `dist-ass/${f(file).ext('srt').nameAppend('-original')}`
        )

      }

    }
  })
}
