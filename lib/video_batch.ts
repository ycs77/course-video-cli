import fs from 'fs'
import { spawn } from 'child_process'
import Bottleneck from 'bottleneck'
import { SingleBar } from 'cli-progress'
import 'colors'
import progressbar from './progressbar'
import { createTimer } from './timer'
import { formatTotalTime } from './output'
import { debug, type LogPrinter } from './debug'
import type { CliOptions } from './types'

export type VideoBatchExec = (cmd: string) => Promise<void>
export type VideoBatchHandle = (options: VideoBatchHandleOptions) => Promise<void>

export interface VideoBatchHandleOptions {
  file: string
  bar: SingleBar
  exec: VideoBatchExec
  log: LogPrinter
}

export interface CliParams {
  video_filter_pattern?: string
  options: CliOptions
}

export interface VideoBatchOptions {
  handle: VideoBatchHandle
  maxConcurrent?: number
  onStart?: () => void
  onStop?: () => void
}

export function videoBatch(cliParams: CliParams, options: VideoBatchOptions) {
  const {
    handle,
    maxConcurrent = 5,
    onStart,
    onStop,
  } = options

  const isLog = cliParams.options.log
  const isLogStderr = cliParams.options.logStderr

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

    const exec: VideoBatchExec = cmd => new Promise<void>(resolve => {
      setTimeout(() => {
        const parts = cmd.split(' ')
        const proc = spawn(parts[0], parts.splice(1))

        if (isLogStderr) {
          proc.stderr.setEncoding('utf-8')
          proc.stderr.on('data', err => {
            console.log('')
            console.error(err)
          })
        }

        proc.on('close', () => {
          resolve()
        })
      }, 100)
    })

    bar.start(videos.length, 0, { speed: 'N/A' })
    timer.start()

    await Promise.all(
      videos.map(file => limiter.schedule(() => new Promise<void>(async resolve => {
        await handle({ file, bar, exec, log })

        bar.increment()

        resolve()
      })))
    )

    timer.stop()
    bar.stop()

    if (onStop) onStop()

    console.log('Successfully'.green)
    formatTotalTime(timer.seconds, '執行時間：')

  })
}
