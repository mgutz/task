import {inspect} from 'util'
import {getLogger} from './log'

export const prettify = (o: any) => inspect(o)

export function trace(msg: string, obj: any) {
  const log = getLogger()
  if (log.level !== 'trace') {
    return
  }
  if (arguments.length === 1) {
    return log.debug(msg)
  }
  log.debug(msg, inspect(obj))
}