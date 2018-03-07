const {inspect} = require('util')
const log = require('./log')

const prettify = o => inspect(o)

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))

function trace(msg, obj) {
  if (!log._istrace) return
  if (arguments.length === 1) {
    return log.debug(msg)
  }
  log.debug(msg, inspect(obj))
}

module.exports = {prettify, sleep, trace}
