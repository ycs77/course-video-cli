import fs from 'fs'
import { exec } from 'child_process'
import { formatTotalTime1, formatTotalTime2 } from './lib/output'

fs.readdir(process.cwd(), async (err, files) => {

  const all_videos_time = await Promise.all(
    files
      .filter(file => /\.mp4$/.test(file))
      .map(file => new Promise<number>(resolve => {
        exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${file}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`error: ${error}`)
              return
            }
            resolve(parseInt(stdout))
          }
        )
      }))
  )

  const seconds = all_videos_time.reduce((v, c) => v + c, 0)

  formatTotalTime1(seconds, '總計時長：')
  formatTotalTime2(seconds)

})
