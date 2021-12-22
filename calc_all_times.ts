import fs from 'fs'
import { exec } from 'child_process'

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

  console.log(`
  ${Math.floor(seconds / 3600)}:${Math.floor(seconds % 3600 / 60)}:${seconds % 60}

  ${Math.floor(seconds / 3600)} 小時
  ${Math.floor(seconds / 60)} 分
  ${seconds} 秒
  `)

})
