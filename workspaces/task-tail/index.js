const tail = require('./tail')
const read = require('./readLinesFromEnd')

module.exports = {...tail, ...read}
