const log = require('./log')

/* eslint-disable no-console */
const exitError = (err, code = 1) => {
  log.error(err)
  process.exit(code)
}

const exitErrorFn = (code = 1) => err => {
  exitError(err, code)
}

const exitOK = msg => {
  log.info(msg ? `OK ${msg}` : 'OK')
  process.exit(0)
}

const exitOKFn = msg => () => {
  exitOK(msg)
}

const exitMessage = (msg, code = 0) => {
  log.info(msg)
  process.exit(code)
}

module.exports = {exitError, exitErrorFn, exitOK, exitOKFn, exitMessage}
