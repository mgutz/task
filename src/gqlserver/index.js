const {start} = require('./server')
const resolvers = require('./resolvers')

const defaults = {
  port: 4200,
  resolvers,
}

start(defaults)
