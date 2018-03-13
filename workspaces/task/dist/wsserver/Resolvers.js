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
const _ = require("lodash");
const iss = require("../core/iss");
const util_1 = require("./util");
const usage_1 = require("../cli/usage");
const tasks_1 = require("../core/tasks");
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
class Resolvers {
    constructor(rcontext) {
        this.rcontext = rcontext;
        /**
         * Loads and sets the project. The project may be reloaded by a
         * browser refresh. The project may only be loaded from a known location for
         * security purposes hence no arguments.
         */
        this.loadProject = () => __awaiter(this, void 0, void 0, function* () {
            const argv = this.rcontext.context.options;
            try {
                const project = yield util_1.loadProjectFile(argv, true);
                this.rcontext.project = project;
                return { c: 200, p: project };
            }
            catch (err) {
                return { c: 500, e: err };
            }
        });
        this.tasks = (taskfileID) => __awaiter(this, void 0, void 0, function* () {
            const found = _.find(this.rcontext.project.taskfiles, { id: taskfileID });
            if (!found) {
                return {
                    c: 422,
                    e: `taskfileID '${taskfileID}' not found in project file`,
                };
            }
            const argv = usage_1.parseArgv(found.argv);
            const tasks = yield tasks_1.loadTasks(argv, found.path);
            if (!tasks) {
                return { c: 200, p: [] };
            }
            // whitelist marshalled properties
            const cleanTasks = _.map(tasks, (task) => _.pick(task, ['deps', 'desc', 'every', 'form', 'name', 'once']));
            return { c: 200, p: cleanTasks };
        });
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
            const cp = util_1.runAsProcess(name, args, client);
            // events are passed through client. return the pid here for the UI
            // to know which pid it is
            return { c: 200, p: { pid: cp.pid } };
        };
    }
}
exports.Resolvers = Resolvers;
//# sourceMappingURL=Resolvers.js.map