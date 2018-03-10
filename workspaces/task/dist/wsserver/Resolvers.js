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
const iss = require("../core/iss");
const runner = require("../core/runner");
const util_1 = require("../core/util");
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
            return this.rcontext.tasks;
        };
        this.run = (a) => __awaiter(this, void 0, void 0, function* () {
            const arg = a;
            const { context } = this.rcontext;
            const task = context.tasks[arg.name];
            if (!task)
                return { code: 422, message: 'Task not found' };
            if (!iss.runnable(task)) {
                return { code: 422, message: 'Task is not runnable' };
            }
            const [argv, err] = util_1.safeParseJSON(arg.argv);
            if (err) {
                return {
                    code: 422,
                    message: err,
                };
            }
            // In the CLI, arbitrary flags become props on argv. For the GUI we need
            // to merge in user's args.
            const args = Object.assign({}, context.options, argv);
            const v = yield runner.runAsProcess(arg.name, args);
            return { code: 200, payload: 'asda' };
        });
    }
}
exports.Resolvers = Resolvers;
//# sourceMappingURL=Resolvers.js.map