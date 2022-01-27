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

export function rename(oldPath: string, newPath: string) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath)
  }
}

export function mustBeExist(path: string) {
  if (!fs.existsSync(path)) {
    console.error(colors.red(`${path} does not exist`))
    process.exit(1)
  }
}
