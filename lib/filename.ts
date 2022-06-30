export class FilenameFluent {
  private _path = ''
  private _name = ''
  private _extension = ''

  constructor(filename: string) {
    this.explode(filename)
  }

  ext(extension: string) {
    this._extension = extension
    return this
  }

  name(text: string): FilenameFluent
  name(callback: (name: string) => string): FilenameFluent
  name(text: string | ((name: string) => string)) {
    if (typeof text === 'function') {
      text = text(this._name)
    }
    this._name = text
    return this
  }

  namePrepend(text: string) {
    this._name = `${text}${this._name}`
    return this
  }

  nameAppend(text: string) {
    this._name = `${this._name}${text}`
    return this
  }

  nameDePrepend(text: string) {
    this._name = this._name.replace(new RegExp(`^${text}`), '')
    return this
  }

  nameDeAppend(text: string) {
    this._name = this._name.replace(new RegExp(`${text}$`), '')
    return this
  }

  getName() {
    return this._name
  }

  getPath() {
    return this._path
  }

  getExtension() {
    return this._extension
  }

  clone() {
    return new FilenameFluent(this.implode())
  }

  private implode() {
    return `${this._path}${this._name}.${this._extension}`
  }

  private explode(filename: string) {
    const matches = filename.match(/^(.*[\\\/])?([^\\\/]*)\.(\w+)$/)
    if (!matches) return
    this._path = matches[1] || ''
    this._name = matches[2]
    this._extension = matches[3]
  }

  toString() {
    return this.implode()
  }

  valueOf() {
    return this.implode()
  }
}

export function f(name: string) {
  return new FilenameFluent(name)
}
