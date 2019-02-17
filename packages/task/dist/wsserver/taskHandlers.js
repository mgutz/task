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
const findProcess = require("find-process");
const fkillit = require("fkill");
const fp = require("path");
const util = require("./util");
const task_ws_1 = require("@mgutz/task-ws");
const tasks_1 = require("../core/tasks");
const usage_1 = require("../cli/usage");
const runAsProcess_1 = require("./runAsProcess");
const globby = require("globby");
const util_1 = require("./util");
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use (code may be 0 too)
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
exports.addBookmark = (context, bookmark) => __awaiter(this, void 0, void 0, function* () {
    const db = context.projectDB;
    const { scope } = bookmark;
    if (scope === 'project') {
        if (!db.has('bookmarks').value()) {
            yield db.set('bookmarks', []).write();
        }
        return db
            .get('bookmarks')
            .push(bookmark)
            .write();
    }
    throw new task_ws_1.CodeError(422, `Only bookmarks having project scope are saved currently: ${scope}`);
});
exports.fkill = (context, argv) => __awaiter(this, void 0, void 0, function* () {
    return fkillit(argv);
});
/**
 * Loads and sets the project. The project may be reloaded by a
 * browser refresh. The project may only be loaded from a known location for
 * security purposes hence no arguments.
 */
exports.loadProject = (context) => __awaiter(this, void 0, void 0, function* () {
    const argv = context.app.options;
    const project = yield util.loadProjectFile(argv, true);
    context.project = project;
    // make paths relative to home to display in UI but do not alter real paths
    if (Array.isArray(project.taskfiles)) {
        const taskfiles = [];
        for (const taskfile of project.taskfiles) {
            taskfiles.push(Object.assign({}, taskfile, { path: util.relativeToHomeDir(taskfile.path) }));
        }
        return Object.assign({}, project, { taskfiles });
    }
    return project;
});
/**
 * Find process by pid, name or keyword.
 */
exports.filterProcesses = (context, kind, keyword) => __awaiter(this, void 0, void 0, function* () {
    const allowed = ['name', 'pid', 'port'];
    if (allowed.indexOf(kind) < 0) {
        throw new task_ws_1.CodeError(422, 'Invalid process kind');
    }
    if (!keyword) {
        throw new task_ws_1.CodeError(422, 'Keyword is required');
    }
    return findProcess(kind, keyword);
});
/**
 * Removes stopped logs.
 */
exports.removeStoppedLogs = (context) => __awaiter(this, void 0, void 0, function* () {
    const files = yield globby([`${util_1.logDir}/**/*`]);
    const running = files.filter((file) => file.endsWith('.pid'));
});
/**
 * Runs a task by name found in taskfile entry from  `Taskproject.json`
 * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
 * args which may be overriden when inbound `argv` is merged.
 *
 * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
 */
exports.run = (context, tag, // echoed back as-is to client, is currently historyId
taskfileId, taskName, argv) => __awaiter(this, void 0, void 0, function* () {
    const { client, project } = context;
    const taskfile = _.find(project.taskfiles, { id: taskfileId });
    if (!taskfile) {
        throw new task_ws_1.CodeError(422, `Taskfile id=${taskfileId} not found`);
    }
    const { path, argv: taskfileArgv } = taskfile;
    // merge inbound client argv with those found in the project file
    const newArgv = Object.assign({}, usage_1.parseArgv(taskfileArgv), util.sanitizeInboundArgv(argv), { file: fp.resolve(path) });
    // this does not wait for process to end, rather it awaits for some async
    // statements like create PID files
    const info = yield runAsProcess_1.default({
        argv: newArgv,
        client,
        context,
        tag,
        taskName,
        taskfileId,
    });
    // events are passed through client. return the pid here for the UI
    // to know which pid it is
    return info;
});
// TODO we need to verify this is a pid started by task, very dangerous
exports.stop = (context, pid) => {
    if (!pid)
        return `z`;
    process.kill(-pid, 'SIGINT');
};
/**
 * Tails a file and sends it to the UI as lines for given historyId.
 *
 * @param context
 * @param logFile
 * @param historyId
 */
exports.tail = (context, logFile, historyId, options = { watch: false }) => {
    const { client } = context;
    return runAsProcess_1.tailLog(client, logFile, historyId, options);
};
exports.tasks = (context, taskfileId) => __awaiter(this, void 0, void 0, function* () {
    const found = _.find(context.project.taskfiles, { id: taskfileId });
    if (!found) {
        throw new task_ws_1.CodeError(422, `taskfileId '${taskfileId}' not found in project file`);
    }
    const argv = usage_1.parseArgv(found.argv);
    const taskList = yield tasks_1.loadTasks(argv, found.path);
    if (!taskList) {
        return [];
    }
    const result = [];
    for (const k in taskList) {
        const task = taskList[k];
        // whitelist marshalled properties
        const tsk = _.pick(task, [
            'deps',
            'desc',
            'every',
            'name',
            'once',
            'ui',
        ]);
        // tasks do not have ids since they are just exported functions. create id
        // based on the taskfile id
        tsk.id = taskfileId + '.' + task.name;
        tsk.execHistory = yield util_1.getExecHistory(taskfileId, task.name);
        result.push(tsk);
    }
    return result;
});
//# sourceMappingURL=taskHandlers.js.map