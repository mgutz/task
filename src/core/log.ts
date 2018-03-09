import * as pino from 'pino'

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
 * Konsole logs to terminal where task started.
 */
export const konsole = newKonsole()

let _level = 'info'

export const setLevel = (level: string) => {
  _level = level
  konsole.level = level
  _log.level = level
}

export const newTerminalLogger = (): pino.Logger => {
  return newKonsole()
}

/**
 * Log logs to terminal if local or through websockets if gui.
 */
const _log = newTerminalLogger()

export const getLogger = (): pino.Logger => {
  return _log
}
