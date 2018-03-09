import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import * as fs from 'fs'
import {buildSchema} from 'graphql'
import * as fp from 'path'
import log from '../core/log'

const loadSchema = async () => {
  const path = fp.join(__dirname, '..', 'schemas', 'api.gql')
  const content = fs.readFileSync(path, 'utf8')
  return buildSchema(content)
}

export interface StartOptions {
  port: number
  resolvers: {[k: string]: ResolverFunc}
}

export const start = async (opts: StartOptions) => {
  const schema = await loadSchema()
  const app = express()
  app.use(
    '/graphql',
    graphqlHTTP({
      graphiql: true,
      rootValue: opts.resolvers,
      schema,
    })
  )
  app.listen(opts.port)
  log.info(`Running GraphQLserver at http://localhost:${opts.port}/graphql`)
}
