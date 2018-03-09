import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import {buildSchema} from 'graphql'
import * as fs from 'fs'
import * as fp from 'path'

const loadSchema = async () => {
  const path = fp.join(__dirname, '..', 'schemas', 'api.gql')
  const content = fs.readFileSync(path, 'utf8')
  return buildSchema(content)
}

export interface StartOptions {
  port: number
  resolvers: {[k: string]: Function}
}

export const start = async (opts: StartOptions) => {
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
  console.log(`Running GraphQLserver at http://localhost:${opts.port}/graphql`)
}
