import {inspect} from 'util'
import {getLogger} from './log'
import * as fp from 'path'

export const appWorkDirectory: string = fp.resolve(__dirname, '..', '..')

export const prettify = (o: any) => inspect(o)

export const trace = (msg: string, obj: any) => {
  const log = getLogger()
  if (log.level !== 'trace') {
    return
  }
  if (arguments.length === 1) {
    return log.debug(msg)
  }
  log.debug(msg, inspect(obj))
}
