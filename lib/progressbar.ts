import { SingleBar } from 'cli-progress'
import colors from 'colors'

export interface ProgressbarOptions {
  isLogMode?: boolean
}

export default function progressbar(options: ProgressbarOptions = {}) {
  const { isLogMode = false } = options

  return new SingleBar({
    format: `progress [${colors.cyan('{bar}')}] {percentage}% | {value}/{total}${isLogMode ? '\n' : ''}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: ' ',
    hideCursor: true,
    noTTYOutput: isLogMode,
  })
}
