import * as pino from 'pino'
let log = pino()

export const setLevel = (level: string) => {
  log.level = level
}

export default log
