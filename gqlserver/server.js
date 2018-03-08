const express = require('express')
const graphqlHTTP = require('express-graphql')
const {buildSchema} = require('graphql')
const fs = require('fs')
const fp = require('path')

const loadSchema = async () => {
  const path = fp.join(__dirname, '..', 'schemas', 'api.gql')
  const content = fs.readFileSync(path, 'utf8')
  return buildSchema(content)
}

const start = async opts => {
  const schema = await loadSchema()
  var app = express()
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      rootValue: opts.resolvers,
      graphiql: true,
    })
  )
  app.listen(opts.port)
  console.log(
    `Running a GraphQL API server at http://localhost:${opts.port}/graphql`
  )
}

module.exports = {start}
