import fs from 'fs'
import 'colors'

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

export function hasContent(path: string) {
  if (fs.existsSync(path)) {
    return !!fs.readFileSync(path, { encoding: 'utf-8' })
  }
  return false
}

export function mustBeExist(path: string) {
  if (!fs.existsSync(path)) {
    console.log()
    console.error(`${path} does not exist`.red)
    process.exit(1)
  }
}

export function mustBeNotExist(path: string) {
  if (fs.existsSync(path)) {
    console.log()
    console.error(`${path} does exist`.red)
    process.exit(1)
  }
}
