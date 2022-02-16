export interface EncoderOptions {
  encode?: BufferEncoding
  decode?: BufferEncoding
  encodeFormat?: (str: string) => string
  decodeFormat?: (str: string) => string
}

export function encoder(options: EncoderOptions = {}) {
  const {
    encode = 'base64',
    decode = 'ascii',
    encodeFormat = str => str,
    decodeFormat = str => str,
  } = options

  return {
    encode: (str: string) => encodeFormat(Buffer.from(str).toString(encode)),
    decode: (str: string) => Buffer.from(decodeFormat(str), encode).toString(decode),
  }
}
