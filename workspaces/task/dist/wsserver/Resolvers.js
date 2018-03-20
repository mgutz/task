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
const os = require("os");
const util_1 = require("./util");
const usage_1 = require("../cli/usage");
const tasks_1 = require("../core/tasks");
const task_ws_1 = require("task-ws");
const kill = require("tree-kill");
const fkillit = require("fkill");
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use (code may be 0 too)
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
class Resolvers {
    constructor(rcontext) {
        this.rcontext = rcontext;
        this.addBookmark = (bookmark) => __awaiter(this, void 0, void 0, function* () {
            const db = this.rcontext.projectDB;
            const { scope } = bookmark;
            if (scope === 'project') {
                return db
                    .get('bookmarks')
                    .push(bookmark)
                    .write();
            }
            throw new task_ws_1.CodeError(422, `Only bookmarks having project scope are saved currently: ${scope}`);
        });
        this.fkill = (argv) => __awaiter(this, void 0, void 0, function* () {
            return fkillit(argv);
        });
        /**
         * Loads and sets the project. The project may be reloaded by a
         * browser refresh. The project may only be loaded from a known location for
         * security purposes hence no arguments.
         */
        this.loadProject = () => __awaiter(this, void 0, void 0, function* () {
            const argv = this.rcontext.context.options;
            const project = yield util_1.loadProjectFile(argv, true);
            this.rcontext.project = project;
            // make paths relative to home to display in UI but do not alter real paths
            if (Array.isArray(project.taskfiles)) {
                const taskfiles = [];
                for (const taskfile of project.taskfiles) {
                    taskfiles.push(Object.assign({}, taskfile, { path: relativeToHomeDir(taskfile.path) }));
                }
                return Object.assign({}, project, { taskfiles });
            }
            return project;
        });
        this.tasks = (taskfileId) => __awaiter(this, void 0, void 0, function* () {
            const found = _.find(this.rcontext.project.taskfiles, { id: taskfileId });
            if (!found) {
                throw new task_ws_1.CodeError(422, `taskfileId '${taskfileId}' not found in project file`);
            }
            const argv = usage_1.parseArgv(found.argv);
            const tasks = yield tasks_1.loadTasks(argv, found.path);
            if (!tasks) {
                return [];
            }
            // whitelist marshalled properties
            const cleanTasks = _.map(tasks, (task) => _.pick(task, ['deps', 'desc', 'every', 'name', 'once', 'ui']));
            return cleanTasks;
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
                throw new task_ws_1.CodeError(422, `Taskfile id=${taskfileId} not found`);
            }
            const { path, argv: taskfileArgv } = taskfile;
            // merge inbound client argv with those found in the project file
            const newArgv = Object.assign({}, usage_1.parseArgv(taskfileArgv), sanitizeInboundArgv(argv), { file: fp.resolve(path) });
            const cp = util_1.runAsProcess(tag, taskfileId, taskName, newArgv, client);
            // events are passed through client. return the pid here for the UI
            // to know which pid it is
            return { pid: cp.pid };
        };
        // TODO we need to verify this is a pid started by task, very dangerous
        this.stop = (pid) => {
            if (!pid)
                return `z`;
            kill(pid);
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
};
const relativeToHomeDir = (path) => fp.join('~', fp.relative(os.homedir(), fp.resolve(path)));
//# sourceMappingURL=Resolvers.js.map