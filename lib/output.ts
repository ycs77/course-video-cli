import 'colors'

export function formatTotalTime(seconds: number, prefix?: string) {
  const formatZero = (num: number, pow: number) => `${'0'.repeat(pow - String(num).length)}${num}`

  console.log(`
  ${prefix}${formatZero(Math.floor(seconds / 3600), 2)}:${formatZero(Math.floor(seconds % 3600 / 60), 2)}:${formatZero(seconds % 60, 2)}`.blue)
}
