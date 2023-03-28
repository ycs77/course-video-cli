export class SubtitleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubtitleError'
  }
}
