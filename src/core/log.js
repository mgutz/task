const pino = require('pino')
const log = pino()

log._setLevel = level => {
  log.setLevel(level)
  // we use inspect in some calls which can be expensive, guard against expensive
  // operations by checking _isdebug or _istrace
  log[`_is${level}`] = true
}
module.exports = log
