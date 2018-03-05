const {inspect} = require('util')

const prettify = o => inspect(o)

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {prettify, sleep}
