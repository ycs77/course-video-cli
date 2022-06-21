import { SingleBar } from 'cli-progress'
import 'colors'

export interface ProgressbarOptions {
  isLogMode?: boolean
}

export default function progressbar(options: ProgressbarOptions = {}) {
  const { isLogMode = false } = options

  return new SingleBar({
    format: `progress [${'{bar}'.cyan}] {percentage}% | {value}/{total} | {eta}s${isLogMode ? '\n' : ''}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: ' ',
    hideCursor: true,
    noTTYOutput: isLogMode,
  })
}
