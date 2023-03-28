import 'colors'

export type LogPrinter = (message: string, content?: any) => void

export function debug(name: string, enabled: boolean = true) {
  const printer: LogPrinter = (message, content) => {
    if (!enabled) return
    if (content) {
      console.log(
        `${`[${name}]`.cyan} ${message}:`,
        typeof content === 'function' ? content() : content
      )
    } else {
      console.log(`${`[${name}]`.cyan} ${message}`)
    }
  }

  return printer
}
