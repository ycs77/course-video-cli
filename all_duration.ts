import fs from 'fs'
import 'colors'
import Bottleneck from 'bottleneck'
import { getDuration } from './lib/duration'
import { formatTotalTime } from './lib/output'
import { SubtitleError } from './lib/error'

export function runAllDuration() {
  fs.readdir(process.cwd(), async (err, files) => {

    const limiter = new Bottleneck({ maxConcurrent: 8 })

    let all_videos_time: number[] = []

    try {
      all_videos_time = await Promise.all(
        files
          .filter(file => /\.mp4$/.test(file))
          .map(file => limiter.schedule(() => getDuration(file)))
      )
    } catch (err) {
      if (err instanceof SubtitleError) {
        console.log()
        console.error(`${err.message}`.red)
        return
      }
    }

    const seconds = all_videos_time.reduce((carry, s) => carry + s, 0)

    formatTotalTime(seconds, '總計時長：')

    console.log()

    console.log(
      '  等於'+
      `約${Math.floor(seconds / 3600)}小時`.blue+
      '  或  '+
      `約${Math.floor(seconds / 60)}分`.blue+
      '  或  '+
      `${seconds}秒`.blue
    )

  })
}
