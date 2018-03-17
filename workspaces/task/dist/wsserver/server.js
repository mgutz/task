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
const WSMessaging = require("ws-messaging");
const log_1 = require("../core/log");
const Resolvers_1 = require("./Resolvers");
const util_1 = require("./util");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const initResolvers = (rcontext) => {
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
exports.start = (ctx, opts) => __awaiter(this, void 0, void 0, function* () {
    const project = (yield util_1.loadProjectFile(ctx.options));
    const adapter = new FileSync(project.path);
    const db = lowdb(adapter);
    const rcontext = {
        context: ctx,
        project,
        projectDB: db,
    };
    const app = express();
    const server = http.createServer(app);
    const connectionHook = initResolvers(rcontext);
    const wss = new WSMessaging({ server }, { connectionHook, WebSocketServer: WebSocket.Server });
    server.listen(opts.port, (err) => {
        if (err)
            return log_1.konsole.error(err);
        log_1.konsole.info(`Running websocket server on http://localhost:${opts.port}`);
    });
});
// server needs Taskproject.ts
//# sourceMappingURL=server.js.map