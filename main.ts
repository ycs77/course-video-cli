import cac from 'cac'
import { runAllDuration } from './all_duration'
import { runMp4ToMp3 } from './mp4_to_mp3'
import { runSubGenerate } from './sub_generate'
import { runSubCorrect } from './sub_correct'
import { runSubMerge } from './sub_merge'

export function run() {
  const cli = cac('cli/tool')

  cli
    .command('')
    .action(() => {
      cli.outputHelp()
    })

  cli.option('--log', 'Log debug message to stdout', { default: false })
  cli.option('--log-stderr', 'Log to stderr', { default: false })

  cli
    .command('all:duration', 'Calc all videos duration')
    .action(() => {
      runAllDuration()
    })

  cli
    .command('mp4:mp3 [video_filter_pattern]', 'Transform mp4 to mp3')
    .action((video_filter_pattern, options) => {
      runMp4ToMp3(video_filter_pattern, options)
    })

  cli
    .command('sub:generate', 'Generate subtitles')
    .action(options => {
      runSubGenerate(options)
    })

  cli
    .command('sub:correct', 'Correct subtitles')
    .action(options => {
      runSubCorrect(options)
    })

  cli
    .command('sub:merge', 'Merge subtitles')
    .action(options => {
      runSubMerge(options)
    })

  cli.help()
  cli.parse()
}
