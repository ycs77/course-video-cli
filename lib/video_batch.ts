import fs from 'fs'
import Bottleneck from 'bottleneck'
import { SingleBar } from 'cli-progress'
import 'colors'
import progressbar from './progressbar'
import { createTimer } from './timer'
import { formatTotalTime } from './output'
import { debug, type LogPrinter } from './debug'
import type { CliOptions } from './types'

export type VideoBatchHandle = (options: VideoBatchHandleOptions) => Promise<void>

export interface VideoBatchHandleOptions {
  file: string
  bar: SingleBar
  log: LogPrinter
}

export interface CliParams {
  video_filter_pattern: string | undefined
  options: CliOptions
}

export interface VideoBatchOptions {
  handle: VideoBatchHandle
  maxConcurrent?: number
  startProgress?: boolean
  onStart?: () => void
  onStop?: () => void
}

export function videoBatch(cliParams: CliParams, options: VideoBatchOptions) {
  const {
    handle,
    maxConcurrent = 5,
    startProgress = true,
    onStart,
    onStop,
  } = options

  const isLog = cliParams.options.log

  const log = debug('log', isLog)
  const bar = progressbar({ isLogMode: isLog })
  const timer = createTimer()
  const limiter = new Bottleneck({ maxConcurrent })

  fs.readdir('dist', async (err, files) => {

    if (onStart) onStart()

    const video_filter_pattern = cliParams.video_filter_pattern || '.*'
    const videos = files.filter(file => new RegExp(`^${video_filter_pattern}\\\.mp4$`).test(file))

    log('dist files', files)
    log('video_filter_pattern', `^${video_filter_pattern}\\\.mp4$`)
    log('filtered videos', videos)

    if (startProgress) bar.start(videos.length, 0)
    timer.start()

    await Promise.all(
      videos.map(file => limiter.schedule(async () => {
        await handle({ file, bar, log })
        if (startProgress) bar.increment()
      }))
    )

    timer.stop()
    if (startProgress) bar.stop()

    if (onStop) onStop()

    console.log('Successfully'.green)
    formatTotalTime(timer.seconds, '執行時間：')

  })
}
