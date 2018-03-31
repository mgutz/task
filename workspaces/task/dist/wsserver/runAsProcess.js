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
const cp = require("child_process");
const fp = require("path");
const fs = require("fs");
const mkdirP = require("mkdirp");
const util_1 = require("util");
const task_tail_1 = require("task-tail");
const log_1 = require("../core/log");
const util_2 = require("./util");
const isRunning = require("is-running");
const mkdirp = util_1.promisify(mkdirP);
const writeFile = util_1.promisify(fs.writeFile);
const unlink = util_1.promisify(fs.unlink);
const taskScript = fp.resolve(__dirname, '..', '..', 'index.js');
/**
 * Since node doesn't have goroutines and libraries like webworker-thread and
 * tiny-worker do not work well with `require`, the best we can do
 * is spawn a task as a child process. In effect, task is calling itself
 * with pre-built argv passed through env variable name `task_ipc_options`
 *
 * Task checks if `task_ipc_options` is set before doing anything else.
 *
 * The argv must have`_.[0]` be the task name and `server: false`.
 */
const runAsProcess = ({ context, tag, taskfileId, taskName, argv, client, }) => __awaiter(this, void 0, void 0, function* () {
    const { project } = context;
    argv._[0] = taskName;
    argv.server = false;
    const historyId = tag.id;
    // const newArgv = _.pick(argv, [
    //   '_',
    //   'babel',
    //   'debug',
    //   'dotenv',
    //   'file',
    //   'dryRun',
    //   'silent',
    //   'trace',
    //   'typescript',
    //   'watch',
    //   'babelExtensions',
    //   'name',
    // ])
    const newArgv = argv;
    const argvstr = JSON.stringify(newArgv);
    // When task is run as a server, it should be long-lived like tmux. Each
    // process pipesj stdout, stderr to file. When task restarts it will read
    // from these proc logs.
    const base = util_2.logBase({
        taskName,
        taskfileId,
        timestamp: util_2.formatDate(),
    });
    const logDir = fp.dirname(base);
    yield mkdirp(logDir);
    const logFile = base + '.log';
    const pidFile = base + '.pid';
    const tagFile = base + '.tag';
    const fd = fs.openSync(logFile, 'a');
    const fileStream = fs.createWriteStream('', { fd });
    const opts = {
        cwd: fp.dirname(argv.file),
        detached: true,
        env: Object.assign({}, process.env, { task_ipc_options: argvstr }),
        stdio: ['ignore', fd, fd],
    };
    // execute the script
    const params = [taskScript];
    const proc = cp.spawn('node', params, opts);
    proc.on('close', (code) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        client.emit('pclose', [historyId, code]);
    });
    proc.on('error', (err) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        client.emit('perror', [historyId, err]);
    });
    // create pid file which lets know if a process is running
    yield writeFile(pidFile, String(proc.pid));
    // create tag file which contains data echoed back to UI on refresh/restart
    yield writeFile(tagFile, JSON.stringify(tag));
    return {
        logFile,
        pid: proc.pid,
    };
});
const tailLogDefaults = {
    intervalMs: 160,
    pid: 0,
    readEndLines: 10,
    watch: false,
};
exports.tailLog = (wsClient, logFile, historyId, options = tailLogDefaults) => __awaiter(this, void 0, void 0, function* () {
    let buf = '';
    const opts = Object.assign({}, tailLogDefaults, options);
    const { intervalMs, pid, readEndLines, watch } = opts;
    log_1.konsole.debug(`Tailing ${logFile} w/ historyId ${historyId}`);
    const sendBuffer = () => {
        if (!buf)
            return;
        const s = buf;
        buf = '';
        wsClient.emit('pout', [historyId, s]);
    };
    let offset = 0;
    if (readEndLines) {
        const { lines, start } = yield task_tail_1.readLinesFromEnd(logFile, readEndLines, 'utf-8');
        buf = lines;
        offset = start;
        sendBuffer();
    }
    if (!watch)
        return;
    if (!pid) {
        log_1.konsole.error(`Cannot watch ${logFile}. pid is required to stop watching`);
    }
    const tail = new task_tail_1.Tail(logFile, '\n', { interval: intervalMs });
    const unwatch = () => {
        tail.unwatch();
        sendBuffer();
    };
    const interval = setInterval(() => {
        if (!isRunning(pid)) {
            clearInterval(interval);
            // console.log(`Process is not running ${pid}. Flushing, clearing watch`)
            tail.flush();
            // need to give tail some time to retrieve lines
            setTimeout(unwatch, intervalMs);
            return;
        }
        sendBuffer();
    }, intervalMs);
    tail.on('line', (line) => {
        buf += line + '\n';
    });
    tail.on('error', (err) => {
        clearInterval(interval);
        log_1.konsole.error(`Could not tail ${logFile}`, err);
    });
    return tail;
});
exports.default = runAsProcess;
//# sourceMappingURL=runAsProcess.js.map