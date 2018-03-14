import * as pino from 'pino'
import {inspect} from 'util'

const newKonsole = (): pino.Logger => {
  const pretty = pino.pretty({
    formatter: (obj: any) => {
      return obj.msg
    },
  })
  pretty.pipe(process.stdout)

  return pino(
    {
      name: 'konsole',
    },
    pretty
  )
}

/**
 * Konsole logs to terminal on host.
 */
export const konsole = newKonsole()

konsole.addLevel('log', 25)

let _level = 'info'

export const setLevel = (level: string) => {
  _level = level
  konsole.level = level
  _log.level = level
}

export const newTerminalLogger = (): pino.Logger => {
  const logger = pino({
    name: 'generic',
  })

  logger.addLevel('log', 25)
  return logger
}

/**
 * Log logs to terminal if task runs in cli mode or through websockets if in
 * server mode.
 */
const _log = newTerminalLogger()

export const getLogger = (): pino.Logger => {
  return _log
}

export const trace = (msg: string, obj: any) => {
  if (_level !== 'trace') {
    return
  }
  if (arguments.length === 1) {
    return _log.debug(msg)
  }
  _log.debug(msg, inspect(obj))
}
