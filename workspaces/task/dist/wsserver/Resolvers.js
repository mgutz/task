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
const fp = require("path");
const util_1 = require("./util");
const usage_1 = require("../cli/usage");
const tasks_1 = require("../core/tasks");
// general response shape
// {c: numeric_code, e: error_message, p: payload}
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
        this.tasks = (taskfileId) => __awaiter(this, void 0, void 0, function* () {
            const found = _.find(this.rcontext.project.taskfiles, { id: taskfileId });
            if (!found) {
                return {
                    c: 422,
                    e: `taskfileId '${taskfileId}' not found in project file`,
                };
            }
            const argv = usage_1.parseArgv(found.argv);
            const tasks = yield tasks_1.loadTasks(argv, found.path);
            if (!tasks) {
                return { c: 200, p: [] };
            }
            // whitelist marshalled properties
            const cleanTasks = _.map(tasks, (task) => _.pick(task, ['deps', 'desc', 'every', 'name', 'once', 'ui']));
            return { c: 200, p: cleanTasks };
        });
        /**
         * Runs a task by name found in taskfile entry from  `Taskproject.json`
         * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
         * args which may be overriden when inbound `argv` is merged.
         *
         * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
         */
        this.run = (tag, // echoed back as-is to client, is currently historyId
        taskfileId, taskName, argv) => {
            const { context, client, project } = this.rcontext;
            const taskfile = _.find(project.taskfiles, { id: taskfileId });
            if (!taskfile) {
                return { c: 422, e: `Taskfile id=${taskfileId} not found` };
            }
            const { path, argv: taskfileArgv } = taskfile;
            // merge inbound client argv with those found in the project file
            const newArgv = Object.assign({}, usage_1.parseArgv(taskfileArgv), sanitizeInboundArgv(argv), { file: fp.resolve(path) });
            const cp = util_1.runAsProcess(tag, taskfileId, taskName, newArgv, client);
            // events are passed through client. return the pid here for the UI
            // to know which pid it is
            return { c: 200, p: { pid: cp.pid } };
        };
    }
}
exports.Resolvers = Resolvers;
/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
const sanitizeInboundArgv = (argv) => {
    if (_.isEmpty(argv))
        return {};
    // TODO task options need to be separate from CLI options
    //
    // In this example: task foo --help -- --help
    //   foo is the task to run
    //   --help is argument to CLI
    //   -- help is argument to the task to run
    return _.omit(argv, [
        '_',
        'file',
        'help',
        'server',
        'init',
        'initExample',
        'list',
        'projectFile',
    ]);
    // const {projectFile, file, server, ...rest} = argv
    // const newArgv = {...rest} as Options
    // console.log('newArgv', newArgv)
    // return newArgv
};
//# sourceMappingURL=Resolvers.js.map