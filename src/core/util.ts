import {inspect} from 'util'
import log from './log'

export const prettify = (o: any) => inspect(o)

export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function trace(msg: string, obj: any) {
  if (log.level !== 'trace') { return }
  if (arguments.length === 1) {
    return log.debug(msg)
  }
  log.debug(msg, inspect(obj))
}
