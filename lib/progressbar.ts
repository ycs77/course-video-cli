import { SingleBar } from 'cli-progress'
import colors from 'colors'

export default function progressbar() {
  return new SingleBar({
    format: `progress [${colors.cyan('{bar}')}] {percentage}% | {value}/{total}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: ' ',
    hideCursor: true,
  })
}
