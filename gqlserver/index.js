/**
 *  Copyright (c) 2015-present, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

const express = require('express')
const graphqlHTTP = require('express-graphql')
const {buildSchema} = require('graphql')
const fs = require('fs')
const fp = require('path')

const defaults = {
  port: 4200,
}

const loadSchema = async () => {
  const path = fp.join(__dirname, '..', 'schemas', 'api.gql')
  const content = fs.readFileSync(path, 'utf8')
  return buildSchema(content)
}

const start = async (opts = defaults) => {
  const schema = await loadSchema()

  // The root provides a resolver function for each API endpoint
  var resolvers = {
    tasks: () => {
      console.log('tasks called')
      return [{name: 'foo'}, {name: 'bar'}]
    },
  }

  var app = express()
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      rootValue: resolvers,
      graphiql: true,
    })
  )
  app.listen(opts.port)
  console.log(
    `Running a GraphQL API server at http://localhost:${opts.port}/graphql`
  )
}

start()
