import { exec } from 'child_process'
import 'colors'

export function getDuration(path: string) {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(`error: ${err}`.red)
          return
        }
        resolve(parseInt(stdout))
      })
    }, 100)
  })
}
