import 'colors'

export function formatTotalTime(seconds: number, prefix: string = '') {
  const formatNumber = (num: number, digites: number) => num.toString().padStart(digites, '0')

  console.log(`
  ${prefix}${
    formatNumber(Math.floor(seconds / 3600), 2)
  }:${
    formatNumber(Math.floor(seconds % 3600 / 60), 2)
  }:${
    formatNumber(seconds % 60, 2)
  }`.blue)
}
