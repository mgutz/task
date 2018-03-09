import * as pino from 'pino'
const log = pino()

export const setLevel = (level: string) => {
  log.level = level
}

export default log
