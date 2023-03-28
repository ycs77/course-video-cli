import fs from 'fs'
import { map, resync, parse, stringify, Node } from 'subtitle'
import { Stream, Transform } from 'stream'
import { rename, rm } from '../fs'
import { f } from '../filename'
import { exec } from '../process'

export function transformFormatSrt(stream: Stream) {
  return stream
    .pipe(resync(-250))
    .pipe(srtStartZero())
    .pipe(fillSubtitleGap(250))
}

export function srtStartZero() {
  return map(node => {
    if (node.type === 'cue' && node.data.start < 0) {
      node.data.start = 0
    }
    return node
  })
}

export function fillSubtitleGap(threshold: number) {
  return mapWithPrev((node, prev) => {
    if (node.type === 'cue' &&
        prev?.type === 'cue' &&
        node.data.start - prev?.data?.end < threshold
    ) {
      node.data.start = prev.data.end
    }
    return node
  })
}

export function mapWithPrev(mapper: (node: Node, prev: Node, index: number) => any) {
  let index = 0
  let prev: Node
  return new Transform({
    objectMode: true,
    autoDestroy: false,
    transform(chunk: Node, _encoding, callback) {
      callback(null, mapper(chunk, prev, index++))
      prev = chunk
    },
  })
}

export interface ModifySubtitleOptions {
  srtOutputFile?: string
}

export async function modifySubtitle(
  srtFile: string,
  handle: (stream: Stream) => Stream = stream => stream,
  options: ModifySubtitleOptions = {}
) {
  const { srtOutputFile } = options

  const srtInputPath = `dist-ass/${srtFile}`
  const srtOutputPath = `dist-ass/${srtOutputFile || srtFile}`

  if (!fs.existsSync(srtInputPath)) return

  await new Promise<void>(resolve => {
    const chunks: Uint8Array[] = []
    handle(
      fs.createReadStream(srtInputPath)
        .pipe(parse())
    )
        .pipe(stringify({ format: 'SRT' }))
        .on('data', chunk => chunks.push(Buffer.from(chunk)))
        .on('end', () => {
          const content = Buffer.concat(chunks).toString('utf-8')
          fs.writeFileSync(srtOutputPath, content, {
            encoding: 'utf-8',
          })
          resolve()
        })
  })
}

export async function srtToAss(file: string, videoPath: string) {
  rm(`dist-ass/${f(file).ext('ass')}`)
  await exec('ffmpeg', [
    '-i', `dist-ass/${file}`,
    `dist-ass/${f(file).ext('ass')}`,
  ])
  rm(`dist-ass/${file}`)

  // 更新 ASS 字幕檔的 metadata
  updateASSMetadata(`dist-ass/${f(file).ext('ass')}`, videoPath)
}

export async function assToSrt(file: string) {
  rm(`dist-ass/${f(file).ext('srt')}`)
  await exec('ffmpeg', [
    '-i', `dist-ass/${file}`,
    '-c:s', 'text',
    `dist-ass/${f(file).ext('srt')}`,
  ])
  rm(`dist-ass/${file}`)
}

export function updateASSMetadata(assPath: string, videoPath: string): void {
  let content = fs.readFileSync(assPath, { encoding: 'utf-8' })

  const ass_header = `[Script Info]
WrapStyle: 0
ScaledBorderAndShadow: yes
ScriptType: v4.00+
YCbCr Matrix: TV.601
PlayResX: 1920
PlayResY: 1080

[Aegisub Project Garbage]
Last Style Storage: Default
Audio File: ${videoPath}
Video File: ${videoPath}
Video AR Mode: 4
Video AR Value: 1.777778
Video Zoom Percent: 0.500000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans TC Bold,64,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,1.2,0,1,1.1,1.2,2,10,10,64,1`

  content = content.replace(/^[\s\S]+(?=\r?\n\r?\n\[Events\])/, ass_header)

  fs.writeFileSync(assPath, content, { encoding: 'utf-8' })
}
