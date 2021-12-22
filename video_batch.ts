import fs from 'fs'
import { argv } from 'process'
import { spawn } from 'child_process'
import colors from 'colors'
import progressbar from './progressbar'
import { SingleBar } from 'cli-progress'

export type FileExt = (filename: string, ext: string) => string
export type VideoBatchExec = (cmd: string) => void

export type VideoBatchHandle = (options: VideoBatchHandleOptions) => void
export interface VideoBatchHandleOptions {
  file: string
  file_ext: FileExt
  resolve: (value: void) => void
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

    const video_filter_pattern = (argv[2] || '.*')
    const videos = files.filter(file => new RegExp(`^${video_filter_pattern}\\\.mp4$`).test(file))
    const file_ext: FileExt = (filename, ext) => filename.replace('.mp4', ext)

    const bar = progressbar()
    bar.start(videos.length, 0, { speed: 'N/A' })

    await Promise.all(
      videos.map(file => new Promise<void>(resolve => {
        const exec: VideoBatchExec = cmd => {
          const proc = spawn(
            cmd.split(' ')[0],
            cmd.split(' ').splice(1)
          )
          proc.stderr.setEncoding('utf8')
          proc.on('close', () => {
            resolve()
          })
        }

        options.handle({ file, file_ext, resolve, bar, exec })

        bar.increment()
      }))
    )

    bar.stop()
    console.log(colors.green('Successfully'))

    if (options.onStop) {
      options.onStop()
    }

  })
}
