import { Stream } from 'stream'
import { map } from 'subtitle'

export const typoMap = {
  '他': '它',
  '訂一': '定義',
  '抬頭': 'title',
  '出發': '觸發',
  '放學': 'function',
  '射程': '設成',
}

export function transformTypoSrt(stream: Stream) {
  return stream.pipe(map(node => {
    if (node.type === 'cue') {
      node.data.text = Object.keys(typoMap).reduce((content, typo) => {
        return content.replace(new RegExp(typo, 'g'), typoMap[typo])
      }, node.data.text)
    }
    return node
  }))
}
