import log from '../core/log'

class TerminalVM {
  process

  exit(code) {
    this.process.exit(code)
  }

  /* eslint-disable no-console */
  exitError(err, code = 1) {
    log.error(err)
    process.exit(code)
  }

  exitErrorFn = (code = 1) => err => {
    this.exitError(err, code)
  }

  exitOK(msg) {
    log.info(msg ? `OK ${msg}` : 'OK')
    process.exit(0)
  }

  exitOKFn = msg => () => {
    this.exitOK(msg)
  }

  exitMessage(msg, code = 0) {
    log.info(msg)
    process.exit(code)
  }
}

module.exports = {TerminalVM}

/*

  TerminalProcess {
    exit()
    a=
  }

*/
