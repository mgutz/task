"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const fs = require("fs");
const graphql_1 = require("graphql");
const fp = require("path");
const log_1 = require("../core/log");
const util_1 = require("../core/util");
const loadSchema = () => __awaiter(this, void 0, void 0, function* () {
    const path = fp.join(util_1.appWorkDirectory, 'schemas', 'api.gql');
    const content = fs.readFileSync(path, 'utf8');
    return graphql_1.buildSchema(content);
});
const isResolver = (r) => typeof r === 'function';
exports.start = (ctx, opts) => __awaiter(this, void 0, void 0, function* () {
    const schema = yield loadSchema();
    const app = express();
    const resolvers = {};
    for (const k in opts.resolvers) {
        const resolver = opts.resolvers[k];
        if (isResolver(resolver)) {
            resolvers[k] = resolver;
        }
    }
    const graphQLHandler = (req, res, graphQLParams) => __awaiter(this, void 0, void 0, function* () {
        return {
            context: { context: ctx, tasks: Object.values(ctx.tasks) },
            graphiql: true,
            rootValue: resolvers,
            schema,
        };
    });
    app.use('/graphql', graphqlHTTP(graphQLHandler));
    app.listen(opts.port);
    log_1.konsole.info(`Running GraphQLserver at http://localhost:${opts.port}/graphql`);
});
//# sourceMappingURL=server.js.map