const prettify = o => JSON.stringify(o, null, 2)

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {prettify, sleep}
