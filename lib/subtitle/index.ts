import type { LogPrinter } from '../debug'
import { Autosub } from './autosub'
import { Whisper } from './whisper'
import type { SubtitleDrivers } from './types'

export function createSubtitle<Driver extends keyof SubtitleDrivers, Instance = SubtitleDrivers[Driver]>(
  driver: Driver,
  options: {
    file: string
    log: LogPrinter
    prompt?: string
  }
): Instance {
  if (driver === 'whisper') {
    return new Whisper(options) as Instance
  }
  return new Autosub(options) as Instance
}

export * from './autosub'
export * from './whisper'
export * from './types'
export * from './utils'
