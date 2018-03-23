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
const taskHandlers = require("./taskHandlers");
const util_1 = require("./util");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const task_ws_1 = require("task-ws");
const onConnection = (rcontext) => {
    const registry = new task_ws_1.RPCRegistry();
    registry.register('task', taskHandlers);
    // only this function is called on connection, handlers above initialize once
    return (socket) => {
        log_1.konsole.log('Connected');
        return new task_ws_1.Server(socket, rcontext, registry);
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
    const wss = new WebSocket.Server({ server });
    task_ws_1.initMessaging(wss, onConnection(rcontext));
    server.listen(opts.port, (err) => {
        if (err)
            return log_1.konsole.error(err);
        log_1.konsole.info(`Running websocket server on http://localhost:${opts.port}`);
    });
});
//# sourceMappingURL=server.js.map