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
    // const tail = await tailLog(client, logFile, historyId, {
    //   readEndLines: 0,
    //   watch: true,
    // } as TailLogParams)
    // execute the script
    const params = [taskScript];
    const proc = cp.spawn('node', params, opts);
    proc.on('close', (code) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        // if (tail) tail.unwatch()
        client.emit('pclose', [historyId, code]);
    });
    proc.on('error', (err) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        client.emit('perror', [historyId, err]);
        // if (tail) tail.unwatch()
    });
    // create pid file which lets know if a process is running
    yield writeFile(pidFile, String(proc.pid));
    // creat tag file which contains data echoed back to UI on refresh/restart
    yield writeFile(tagFile, JSON.stringify(tag));
    // const tail = new Tail(logFile)
    // tail.on('line', (line: string) => client.emit('pout', [tag, line]))
    // tail.on('error', (err: Error) =>
    //   konsole.error(`Could not tail ${logFile}`, err)
    // )
    return {
        logFile,
        pid: proc.pid,
    };
});
const tailLogDefaults = {
    intervalMs: 160,
    readEndLines: 10,
    watch: false,
};
exports.tailLog = (wsClient, logFile, historyId, options = tailLogDefaults) => __awaiter(this, void 0, void 0, function* () {
    let buf = '';
    const { intervalMs, readEndLines, watch } = Object.assign({}, tailLogDefaults, options);
    log_1.konsole.log(`Tailing ${logFile} w/ historyId ${historyId}`);
    const sendBuffer = () => {
        if (!buf)
            return;
        const s = buf;
        buf = '';
        wsClient.emit('pout', [historyId, s]);
    };
    let offset = 0;
    if (readEndLines) {
        const { lines, start } = yield task_tail_1.readLastNLines(logFile, readEndLines, 'utf-8');
        buf = lines;
        offset = start;
        sendBuffer();
    }
    if (!watch)
        return;
    const intervalId = setInterval(sendBuffer, intervalMs);
    const tail = new task_tail_1.Tail(logFile, '\n', { interval: intervalMs, start: offset });
    tail.on('line', (line) => {
        buf += line + '\n';
    });
    tail.on('error', (err) => {
        clearInterval(intervalId);
        log_1.konsole.error(`Could not tail ${logFile}`, err);
    });
    return tail;
});
exports.default = runAsProcess;
//# sourceMappingURL=runAsProcess.js.map