const tail = require('./tail')
const read = require('./readLastNLines')

module.exports = {...tail, ...read}
