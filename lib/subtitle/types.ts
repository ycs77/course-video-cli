import { Autosub } from './autosub'
import { Whisper } from './whisper'

export interface SubtitleDrivers {
  autosub: Autosub
  whisper: Whisper
}

export interface Subtitle {
  transcribe(): Promise<void>
}
