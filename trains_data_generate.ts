import fs from 'fs'
import Bottleneck from 'bottleneck'
import { map, resync } from 'subtitle'
import { videoBatch } from './lib/video_batch'
import { mustBeExist, mkdir, hasContent } from './lib/fs'
import { f } from './lib/filename'
import { exec } from './lib/process'
import { modifySubtitle, assToSrt, srtToAss } from './lib/subtitle'
import 'colors'
import type { CliOptions } from './lib/types'

export interface Line {
  id: string
  text: string
  audio: string
}

export function runTrainsDataGenerate(video_filter_pattern: string, options: CliOptions) {
  videoBatch({ video_filter_pattern, options }, {
    maxConcurrent: 1,
    startProgress: false,
    onStart() {

      mustBeExist('dist-mp3')
      mustBeExist('dist-ass')

      mkdir('dist-data')

    },
    async handle({ file, bar, log }) {

      const fileName = f(file).getName()
      const chapter = Number(fileName.split('-')[0])
      const section = Number(fileName.split('-')[1])
      const sectionId = generateSectionId(chapter, section)

      const runCmds: (string | [string, string[]])[] = []
      const lines: Line[] = []

      if (!fs.existsSync(`dist-ass/${f(file).ext('ass')}`)) {
        console.log(`${f(file).ext('ass')} can't record`.yellow)
        return
      }

      function captureLines() {
        return map((node, i) => {
          if (node.type === 'cue') {
            const id = generateId(chapter, section, i + 1)
            const wavFilePath = `wav/${sectionId}/${id}.wav`
            const start = node.data.start / 1000 // 秒
            const end = node.data.end / 1000 // 秒

            mkdir('dist-data/wav')
            mkdir(`dist-data/wav/${sectionId}`)

            // 分割成wav
            const cmd = `ffmpeg -i dist-mp3/${f(file).ext('mp3')} -ss ${start} -to ${end} -ac 1 -ar 16000 -f wav dist-data/${wavFilePath}`
            log(`ffmpeg cmd`, cmd)
            runCmds.push(cmd)

            lines.push({
              id,
              text: node.data.text,
              audio: wavFilePath,
            })
          }
          return node
        })
      }

      await assToSrt(`${f(file).ext('ass')}`)
      await modifySubtitle(`${f(file).ext('srt')}`, stream => {
        return stream
          .pipe(resync(250))
          .pipe(captureLines())
      })
      await srtToAss(`${f(file).ext('srt')}`, `../dist/${file}`)

      log('runCmds', runCmds.map(cmd =>
        Array.isArray(cmd)
          ? `${cmd[0]} ${cmd[1].join(' ')}`
          : cmd)
      )
      log('lines', lines)


      bar.start(runCmds.length, 0)
      const limiter = new Bottleneck({ maxConcurrent: 6 })
      await Promise.all(runCmds.map(cmd => limiter.schedule(async () => {
        if (Array.isArray(cmd)) {
          await exec(cmd[0], cmd[1])
        } else {
          await exec(cmd)
        }
        bar.increment()
      })))
      bar.stop()

      const break_trans = hasContent('dist-data/trans.txt') ? '\n' : ''
      const break_wav = hasContent('dist-data/wav.scp') ? '\n' : ''
      fs.appendFileSync('dist-data/trans.txt', break_trans + lines.map(line => {
        return `${line.id}\t${line.text}`
      }).join('\n'))
      fs.appendFileSync('dist-data/wav.scp', break_wav + lines.map(line => {
        return `${line.id}\t${line.audio}`
      }).join('\n'))

      console.log(`${sectionId} generated`.green)

    },
  })
}

function generateId(chapter: number, section: number, i: number) {
  return 'I' + generateSectionId(chapter, section) + 'W' + i.toString().padStart(4, '0')
}

function generateSectionId(chapter: number, section: number) {
  return [
    'C' + chapter.toString().padStart(2, '0'),
    'S' + section.toString().padStart(2, '0'),
  ].join('')
}
