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
const http = require("http");
const WebSocket = require("ws");
const log_1 = require("../core/log");
const Resolvers_1 = require("./Resolvers");
const util_1 = require("./util");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const task_ws_1 = require("task-ws");
// const initResolvers = (rcontext: ResolverContext) => {
//   return (client: any, authData: any) => {
//     const resolverContext = {...rcontext, authData, client}
//     // register any function that does not start with '_'
//     const resolvers = new Resolvers(resolverContext)
//     for (const k in resolvers) {
//       // @ts-ignore
//       const resolver = resolvers[k]
//       if (k.startsWith('_') || typeof resolver !== 'function') continue
//       client.register(k, resolver)
//     }
//     return Promise.resolve()
//   }
// }
const initResolversWsMessaging = (rcontext) => {
    return (client, authData) => {
        const resolverContext = Object.assign({}, rcontext, { authData, client });
        // register any function that does not start with '_'
        const resolvers = new Resolvers_1.Resolvers(resolverContext);
        for (const k in resolvers) {
            // @ts-ignore
            const resolver = resolvers[k];
            if (k.startsWith('_') || typeof resolver !== 'function')
                continue;
            client.register(k, resolver);
        }
        return Promise.resolve();
    };
};
const initResolvers = (rcontext) => {
    return (client, authData) => {
        log_1.konsole.log('Connected');
        const resolverContext = Object.assign({}, rcontext, { authData, client });
        // register any function that does not start with '_'
        const resolvers = new Resolvers_1.Resolvers(resolverContext);
        for (const k in resolvers) {
            // @ts-ignore
            const resolver = resolvers[k];
            if (k.startsWith('_') || typeof resolver !== 'function')
                continue;
            client.register(k, resolver);
        }
        return Promise.resolve();
    };
};
exports.start = (ctx, opts) => __awaiter(this, void 0, void 0, function* () {
    const project = (yield util_1.loadProjectFile(ctx.options));
    const adapter = new FileAsync(project.path);
    const db = yield lowdb(adapter);
    const rcontext = {
        context: ctx,
        project,
        projectDB: db,
    };
    const app = express();
    const server = http.createServer(app);
    // BEGIN task-ws
    const wss = new WebSocket.Server({ server });
    task_ws_1.initMessaging(wss, initResolvers(rcontext));
    // END task-ws
    // BEGIN ws-messaging
    // const connectionHook = initResolversWsMessaging(rcontext)
    // const wss = new WSMessaging(
    //   {server},
    //   {connectionHook, WebSocketServer: WebSocket.Server}
    // )
    // END ws-messaging
    server.listen(opts.port, (err) => {
        if (err)
            return log_1.konsole.error(err);
        log_1.konsole.info(`Running websocket server on http://localhost:${opts.port}`);
    });
});
// server needs Taskproject.ts
//# sourceMappingURL=server.js.map