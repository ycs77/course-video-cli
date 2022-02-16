import colors from 'colors'

export type LogPrinter = (message: string, content: any) => void

export function debug(name: string, enabled: boolean = true) {
  const printer: LogPrinter = (message, content) => {
    if (enabled) {
      console.log(`${colors.cyan(`[${name}]`)} ${message}:`, typeof content === 'function' ? content() : content)
    }
  }

  return printer
}
