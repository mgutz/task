const server = require('./src/server')
const registry = require('./src/rpcRegistry')
const CodeError = require('./src/codeError')

module.exports = Object.assign({}, registry, server, CodeError)
