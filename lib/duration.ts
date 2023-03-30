import { exec } from 'child_process'
import { SubtitleError } from './error'

export function getDuration(path: string) {
  return new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(new SubtitleError(`error: ${err.message}`))
          return
        }
        resolve(parseInt(stdout))
      })
    }, 100)
  })
}
