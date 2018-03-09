import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import * as fs from 'fs'
import {buildSchema} from 'graphql'
import * as fp from 'path'
import {konsole} from '../core/log'
import {appWorkDirectory} from '../core/util'
import {AppContext} from '../core/AppContext'

const loadSchema = async () => {
  const path = fp.join(appWorkDirectory, 'schemas', 'api.gql')
  const content = fs.readFileSync(path, 'utf8')
  return buildSchema(content)
}

export interface StartOptions {
  port: number
  resolvers: {[k: string]: ResolverFunc}
}

export const start = async (ctx: AppContext, opts: StartOptions) => {
  const schema = await loadSchema()
  const app = express()

  const graphQLHandler = async (req: any, res: any, graphQLParams: any) => {
    return {
      context: {context: ctx, tasks: Object.values(ctx.tasks)},
      graphiql: true,
      rootValue: opts.resolvers,
      schema,
    }
  }

  app.use('/graphql', graphqlHTTP(graphQLHandler as any))
  app.listen(opts.port)
  konsole.info(`Running GraphQLserver at http://localhost:${opts.port}/graphql`)
}
