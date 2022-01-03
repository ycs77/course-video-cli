import fs from 'fs'
import { spawn } from 'child_process'
import colors from 'colors'
import progressbar from './progressbar'
import type { SingleBar } from 'cli-progress'
import { createTimer } from './timer'
import { formatTotalTime1 } from './output'

export type FileExt = (filename: string, ext: string) => string
export type VideoBatchExec = (cmd: string) => Promise<void>

export type VideoBatchHandle = (options: VideoBatchHandleOptions) => Promise<void>
export interface VideoBatchHandleOptions {
  file: string
  file_ext: FileExt
  bar: SingleBar
  exec: VideoBatchExec
}

export interface VideoBatchOptions {
  handle: VideoBatchHandle
  onStart?: () => void
  onStop?: () => void
}

export default function video_batch(options: VideoBatchOptions) {
  fs.readdir(process.cwd(), async (err, files) => {

    if (options.onStart) {
      options.onStart()
    }

    const isDebug = process.argv.includes('--debug')

    const bar = progressbar()
    const timer = createTimer()

    const video_filter_pattern = process.argv[2] || '.*'
    const videos = files.filter(file => new RegExp(`^${video_filter_pattern}\\\.mp4$`).test(file))
    const file_ext: FileExt = (filename, ext) => filename.replace('.mp4', ext)

    const exec: VideoBatchExec = cmd => new Promise<void>(resolve => {
      const proc = spawn(
        cmd.split(' ')[0],
        cmd.split(' ').splice(1)
      )

      if (isDebug) {
        proc.stderr.setEncoding('utf8')
        proc.stderr.on('data', err => {
          console.log('')
          console.error(err)
        })
      }

      proc.on('close', () => {
        resolve()
      })
    })

    bar.start(videos.length, 0, { speed: 'N/A' })
    timer.start()

    await Promise.all(
      videos.map(file => new Promise<void>(async resolve => {
        await options.handle({ file, file_ext, bar, exec })

        bar.increment()

        resolve()
      }))
    )

    timer.stop()
    bar.stop()

    if (options.onStop) {
      options.onStop()
    }

    console.log(colors.green('Successfully'))
    formatTotalTime1(timer.seconds, '執行時間：')

  })
}
