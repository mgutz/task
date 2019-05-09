import * as pino from 'pino'
import * as stringify from 'stringify-object'

// Options for stringifying an object. The body of functions are too noisy
// Convert functions to 'Function' and 'AsyncFunction'
const stringifyOpts = {
  indent: '  ',

  transform: (obj: any, prop: any, originalResult: string) => {
    if (typeof obj[prop] === 'function') {
      if (originalResult.startsWith('async')) {
        return 'AsyncFunction'
      }
      return 'Function'
    }

    return originalResult
  },
}

export const newTerminalLogger = (name = 'default', opts = {}): pino.Logger => {
  const logger = pino({
    // @ts-ignore
    customLevels: {
      log: 25,
    },
    name,
    prettyPrint: process.stdout.isTTY,
    ...opts,
  })

  return logger
}

/**
 * PlainPrettier is a simple prettifier to display messages and optionally color
 * the logline based on the level. Colors are disabled if --no-colors is set.
 *
 * @param options is passed in by pino.
 */
export const plainPrettifier = (options: any) => {
  const {messageKey} = options
  const isObject = (input: any): boolean => {
    return Object.prototype.toString.apply(input) === '[object Object]'
  }

  const isPinoLog = (log: any): boolean => {
    return log && (log.hasOwnProperty('v') && log.v === 1)
  }

  // Deal with whatever options are supplied.
  return (inputData: any) => {
    if (typeof inputData === 'string') {
      return inputData
    } else if (isObject(inputData) && isPinoLog(inputData)) {
      return inputData[messageKey]
    }
    return undefined
  }
}

/**
 * Konsole is used for interactive terminals. It should not be JSON.
 */
export const konsole = newTerminalLogger('konsole', {
  prettifier: plainPrettifier,
  prettyPrint: true,
})

let _level = 'info'

export const setLevel = (level: string) => {
  _level = level
  konsole.level = level
  _log.level = level
}

/**
 * Log logs to terminal if task runs in cli mode or through websockets if in
 * server mode.
 */
const _log = newTerminalLogger()

export const getLogger = (): pino.Logger => {
  return _log
}

export const trace = (msg: string, obj?: any) => {
  if (_level !== 'trace') {
    return
  }
  if (obj === undefined) {
    _log.debug(msg)
    return
  }

  _log.debug(msg, stringify(obj, stringifyOpts))
}
