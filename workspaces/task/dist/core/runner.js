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
const contrib = require("../contrib");
const cp = require("child_process");
const fp = require("path");
const iss = require("./iss");
const depsGraph_1 = require("./depsGraph");
const log_1 = require("./log");
const watch_1 = require("./watch");
const taskScript = fp.resolve(__dirname, '..', '..', 'index.js');
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
        args = exports.taskParam(ctx.options);
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
    const args = exports.taskParam(ctx.options);
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
exports.taskParam = (argv, additionalProps = {}) => {
    const sh = require('shelljs');
    const globby = require('globby');
    const prompt = require('inquirer').createPromptModule();
    const execAsync = (...args) => {
        return new Promise((resolve, reject) => {
            sh.exec(...args, (code, stdout, stderr) => {
                if (code !== 0) {
                    return reject({ code, stdout, stderr });
                }
                return resolve({ code, stdout, stderr });
            });
        });
    };
    return {
        _,
        argv: Object.assign({}, argv, { _: argv._.slice(1) }, additionalProps),
        contrib,
        exec: execAsync,
        globby,
        prompt,
        sh,
        shawn: contrib.shawn,
    };
};
/**
 * Since node doesn't have goroutines and libraries like webworker-thread and
 * tiny-worker do not work well with `require`, the best we can do
 * is spawn a task as a child process. In effect, task is calling itself
 * with pre-built argv passed through env variable name `task_ipc_options`
 *
 * Task checks if `task_ipc_options` is set before doing anything else.
 *
 * The argv must have`_.[0]` be the task name and `gui: false`.
 */
exports.runAsProcess = (name, argv) => {
    argv._[0] = name;
    argv.gui = false;
    const opts = {
        detached: true,
        env: Object.assign({}, process.env, { task_ipc_options: JSON.stringify(argv) }),
        stdio: 'inherit',
    };
    // execute the script
    const params = [taskScript];
    const proc = cp.spawn('node', params, opts);
    return proc;
};
//# sourceMappingURL=runner.js.map