import colors from 'colors'

export function formatTotalTime1(seconds: number, prefix?: string) {
  const formatZero = (num: number, pow: number) => `${'0'.repeat(pow - String(num).length)}${num}`

  console.log(colors.blue(`
  ${prefix}${formatZero(Math.floor(seconds / 3600), 2)}:${formatZero(Math.floor(seconds % 3600 / 60), 2)}:${formatZero(seconds % 60, 2)}`))
}

export function formatTotalTime2(seconds: number) {
  console.log(colors.blue(`
  ${Math.floor(seconds / 3600)} 小時
  ${Math.floor(seconds / 60)} 分
  ${seconds} 秒`))
}
