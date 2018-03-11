"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iss = require("../core/iss");
const runAsProcess_1 = require("./runAsProcess");
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
class Resolvers {
    constructor(rcontext) {
        this.rcontext = rcontext;
        this.tasks = (arg) => {
            return { c: 200, p: this.rcontext.tasks };
        };
        // {c: numeric_code, e: error_message, p: payload}
        this.run = (name, argv) => {
            const { context, client } = this.rcontext;
            const task = context.tasks[name];
            if (!task)
                return { c: 422, e: 'Task not found' };
            if (!iss.runnable(task)) {
                return { c: 422, e: 'Task is not runnable' };
            }
            // In the CLI, arbitrary flags become props on argv. For the GUI we need
            // to merge in user's args.
            const args = Object.assign({}, context.options, argv);
            const cp = runAsProcess_1.runAsProcess(name, args, client);
            // events are passed through client. return the pid here for the UI
            // to know which pid it is
            return { c: 200, p: { pid: cp.pid } };
        };
    }
}
exports.Resolvers = Resolvers;
//# sourceMappingURL=Resolvers.js.map