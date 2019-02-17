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
const iss = require("./iss");
const depsGraph_1 = require("./depsGraph");
const log_1 = require("./log");
const watch_1 = require("./watch");
const util_1 = require("./util");
process.on('SIGINT', () => {
    const log = log_1.getLogger();
    log.info('cleaning up...');
    for (const name in _childProcesses) {
        const proc = _childProcesses[name];
        if (proc) {
            log.debug(`SIGHUP ${name}`);
            process.kill(-proc.pid, 'SIGHUP');
        }
    }
    process.exit();
});
const _childProcesses = {};
const runTask = (tasks, task, args, wait = true) => __awaiter(this, void 0, void 0, function* () {
    const log = log_1.getLogger();
    if (didRun(task) && !task.every) {
        logDryRun(args.argv, `skip ${task.name} ran already`);
        return;
    }
    track(task);
    if (iss.parallelTask(task)) {
        logDryRun(args.argv, `begin ${task.name}: {${task.deps.join(', ')}}`);
        const promises = task.deps.map((ref) => {
            return runTask(tasks, tasks[ref], args, false);
        });
        return Promise.all(promises).then(() => {
            logDryRun(args.argv, `end ${task.name}`);
        });
    }
    else if (Array.isArray(task.deps)) {
        logDryRun(args.argv, `begin ${task.name}: [${task.deps.join(', ')}]`);
        for (const ref of task.deps) {
            yield runTask(tasks, tasks[ref], args, true);
        }
        logDryRun(args.argv, `end ${task.name}`);
    }
    const childProcess = _childProcesses[task.name];
    if (childProcess) {
        childProcess.removeAllListeners();
        childProcess.once('close', (code) => {
            log.debug(`Task '${task.name}' process exited ${code}`);
            _childProcesses[task.name] = null;
            // ensure it is not being tracked so the immediate call to rerun
            // does not think it has already run
            untrack(task);
            setImmediate(() => runTask(tasks, task, args));
        });
        log.debug(`SIGHUP ${task.name}`);
        // regarding -pid, see https://stackoverflow.com/a/33367711
        process.kill(-childProcess.pid, 'SIGHUP');
        return;
    }
    if (typeof task.run !== 'function') {
        return;
    }
    logDryRun(args.argv, `RUN ${task.name}...`);
    if (args.argv['dry-run']) {
        return;
    }
    let v;
    if (wait) {
        v = yield task.run(args);
        log.debug(`END ${task.name}`);
    }
    else {
        v = task.run(args);
        if (iss.promise(v)) {
            v = v.then((res) => {
                log.debug(`END ${task.name}`);
                return res;
            });
        }
        else {
            log.debug(`END ${task.name}`);
        }
    }
    if (iss.childProcess(v)) {
        log.debug('Tracking old process');
        _childProcesses[task.name] = v;
        return new Promise((resolve, reject) => {
            v.once('close', (code) => {
                log.debug(`Task '${task.name}' process exited: ${code}`);
                _childProcesses[task.name] = null;
                untrack(task);
                resolve({ code });
            });
            v.on('error', (err) => {
                log.info('error occured', err);
                untrack(task);
                reject(err);
            });
        });
    }
    return v;
});
const logDryRun = (argv, msg) => {
    const log = log_1.getLogger();
    if (argv.dryRun) {
        log.info(msg);
        return;
    }
    log.debug(msg);
};
const getTask = (tasks, name) => {
    const task = tasks[name];
    return iss.runnable(task) ? task : null;
};
const clearTracking = (tasks) => {
    for (const name in tasks) {
        const task = tasks[name];
        if (task.once) {
            continue;
        }
        task._ran = false;
    }
};
const track = (task) => (task._ran = true);
const untrack = (task) => (task._ran = false);
const didRun = (task) => task._ran;
exports.run = (ctx, name, args) => __awaiter(this, void 0, void 0, function* () {
    const { log, tasks } = ctx;
    if (!args) {
        args = util_1.taskParam(ctx.options);
    }
    if (!tasks) {
        throw new Error('`tasks` property is required');
    }
    if (!name || !_.isString(name)) {
        throw new Error('`name` is blank or not a string');
    }
    const deps = depsGraph_1.execOrder(tasks, name);
    log.debug('Tasks', tasks);
    logDryRun(args.argv, `Exec order [${deps.join(', ')}]`);
    const results = [];
    for (const dep of deps) {
        const task = getTask(tasks, dep);
        // tasks can just be deps
        if (task) {
            const result = yield runTask(tasks, task, args);
            results.push({ name: task.name, result });
        }
        else {
            throw new Error('Object is not a task');
        }
    }
    return results;
});
exports.runThenWatch = (ctx, name) => __awaiter(this, void 0, void 0, function* () {
    const { log, tasks } = ctx;
    const args = util_1.taskParam(ctx.options);
    const task = getTask(tasks, name);
    if (!(task && Array.isArray(task.watch))) {
        throw new Error(`${name} is not a watchable task.`);
    }
    const globs = task.watch;
    let first = true;
    yield watch_1.watch(globs, args, (argsWithEvent) => __awaiter(this, void 0, void 0, function* () {
        clearTracking(tasks);
        if (!first) {
            log.info(`Restarting ${name}`);
        }
        first = false;
        yield exports.run(ctx, name, argsWithEvent);
    }));
});
//# sourceMappingURL=runner.js.map