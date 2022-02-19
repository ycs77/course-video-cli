import fs from 'fs'
import colors from 'colors'

export function mkdir(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

export function copy(src: string, dest: string) {
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest)) rm(dest)
    fs.copyFileSync(src, dest)
  }
}

export function rm(path: string) {
  if (fs.existsSync(path)) {
    fs.rmSync(path)
  }
}

export function rename(oldPath: string, newPath: string) {
  if (fs.existsSync(oldPath)) {
    rm(newPath)
    fs.renameSync(oldPath, newPath)
  }
}

export function mustBeExist(path: string) {
  if (!fs.existsSync(path)) {
    console.error(colors.red(`${path} does not exist`))
    process.exit(1)
  }
}
