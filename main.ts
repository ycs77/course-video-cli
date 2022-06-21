import cac from 'cac'
import { runAllDuration } from './all_duration'
import { runMp4ToMp3 } from './mp4_to_mp3'
import { runSubGenerate } from './sub_generate'
import { runSubCorrect } from './sub_correct'
import { runSubMerge } from './sub_merge'
import { runTrainsDataGenerate } from './trains_data_generate'

export function run() {
  const cli = cac('cli/tool')

  cli
    .command('')
    .action(() => {
      cli.outputHelp()
    })

  cli.option('--log', 'Log debug message to stdout', { default: false })

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
    .command('sub:generate [video_filter_pattern]', 'Generate subtitles')
    .action((video_filter_pattern, options) => {
      runSubGenerate(video_filter_pattern, options)
    })

  cli
    .command('sub:correct [video_filter_pattern]', 'Correct subtitles')
    .action((video_filter_pattern, options) => {
      runSubCorrect(video_filter_pattern, options)
    })

  cli
    .command('sub:merge [video_filter_pattern]', 'Merge subtitles')
    .action((video_filter_pattern, options) => {
      runSubMerge(video_filter_pattern, options)
    })

  cli
    .command('trains-data:generate [video_filter_pattern]', 'Generate the audios for trains')
    .action((video_filter_pattern, options) => {
      runTrainsDataGenerate(video_filter_pattern, options)
    })

  cli.help()
  cli.parse()
}
