/* eslint-disable no-console */
const exitError = (err, code = 1) => {
  console.error(err)
  process.exit(code)
}

const exitErrorFn = (code = 1) => err => {
  exitError(err, code)
}

const exitOK = msg => {
  console.log(msg ? `OK ${msg}` : 'OK')
  process.exit(0)
}

const exitOKFn = msg => () => {
  exitOK(msg)
}

const exitMessage = (msg, code = 0) => {
  console.log(msg)
  process.exit(code)
}

module.exports = {exitError, exitErrorFn, exitOK, exitOKFn, exitMessage}
