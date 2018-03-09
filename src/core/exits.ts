import {konsole} from './log'

/* eslint-disable no-console */
export const error = (err: any, code = 1) => {
  konsole.error(err)
  process.exit(code)
}

export const errorFn = (code = 1) => (err: any) => {
  error(err, code)
}

export const ok = (msg: string) => {
  konsole.info(msg ? `OK ${msg}` : 'OK')
  process.exit(0)
}

export const okFn = (msg: string = '') => () => {
  ok(msg)
}

export const message = (msg: string, code = 0) => {
  konsole.info(msg)
  process.exit(code)
}
