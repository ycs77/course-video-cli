import fs from 'fs'
import Bottleneck from 'bottleneck'
import { getDuration } from './lib/duration'
import { formatTotalTime1, formatTotalTime2 } from './lib/output'

fs.readdir(process.cwd(), async (err, files) => {

  const limiter = new Bottleneck({ maxConcurrent: 8 })

  const all_videos_time = await Promise.all(
    files
      .filter(file => /\.mp4$/.test(file))
      .map(file => limiter.schedule(() => getDuration(file)))
  )

  const seconds = all_videos_time.reduce((carry, s) => carry + s, 0)

  formatTotalTime1(seconds, '總計時長：')
  formatTotalTime2(seconds)

})
