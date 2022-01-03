import fs from 'fs'
import colors from 'colors'

export function mkdir(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

export function rm(path: string) {
  if (fs.existsSync(path)) {
    fs.rmSync(path)
  }
}

export function dirMustBeExist(path: string) {
  if (!fs.existsSync(path)) {
    console.error(colors.red(`${path} directory does not exist`))
    process.exit(1)
  }
}