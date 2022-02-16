import fs from 'fs'

export function replace_ass_header(assPath: string, videoPath: string): void {
  let content = fs.readFileSync(assPath, { encoding: 'utf-8' })

  const ass_header = `[Script Info]
; Script generated by Aegisub 3.2.2
; http://www.aegisub.org/
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

  content = content.replace(/^[\s\S]+(?=\n\n\[Events\])/, ass_header)

  fs.writeFileSync(assPath, content, { encoding: 'utf-8' })
}
