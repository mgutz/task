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
const cp = require("child_process");
const fp = require("path");
const fs = require("fs");
const stream = require("stream");
const mkdirP = require("mkdirp");
const util_1 = require("util");
const read = require("safe-log-reader");
const mkdirp = util_1.promisify(mkdirP);
const writeFile = util_1.promisify(fs.writeFile);
const unlink = util_1.promisify(fs.unlink);
const taskScript = fp.resolve(__dirname, '..', '..', 'index.js');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const defaultLogPathPattern = '.pids/{{taskfileId}}/{{timestamp}}-{{taskName}}-{{pid}}';
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
    const passthrough = new stream.PassThrough();
    // const wsb = new streamBuffers.WritableStreamBuffer({
    //   // grow by 10 kilobytes each time buffer overflows.
    //   incrementAmount: 10 * 1024,
    //   // start at 100 kilobytes.
    //   initialSize: 100 * 1024,
    // })
    passthrough.setEncoding('utf-8');
    // When task is run as a server, it should be long-lived like tmux. Each
    // process pipesj stdout, stderr to file. When task restarts it will read
    // from these proc logs.
    const pid = process.pid; // use parent's PID
    const pathPattern = project.server.logPathPattern || defaultLogPathPattern;
    const template = _.template(pathPattern);
    const logFile = template({
        pid,
        taskName,
        taskfileId,
        timestamp: new Date().toISOString(),
    });
    const logDir = fp.dirname(logFile);
    const pidFile = fp.join(logDir, String(pid));
    yield mkdirp(logDir);
    // create pid file
    yield writeFile(pidFile, '');
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
    // pipe stdout to buffer
    // proc.stdout.setEncoding('utf-8')
    // // proc.stdout.on('data', (data) => {
    // //   client.emit('pout', [tag, proc.pid, data])
    // // })
    //proc.stdout.pipe(passthrough)
    // pipe stderr to buffer
    // proc.stderr.setEncoding('utf-8')
    //proc.stderr.pipe(passthrough)
    // pipe buffer to file
    //wsb.pipe(passthrough)
    //passthrough.pipe(fileStream)
    // const bookmarkFile = fp.resolve(logDir, 'bookmark')
    // console.log('bookmarkfile', bookmarkFile)
    const reader = read
        .createReader(logFile, {
        batchLimit: 4096,
        bookmark: { dir: logDir },
    })
        .on('readable', function () {
        this.readLine();
    })
        .on('read', (line, count) => {
        client.emit('pout', [tag, proc.pid, line]);
    });
    proc.on('close', (code) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        client.emit('pclose', [tag, proc.pid, code]);
    });
    proc.on('error', (err) => {
        fs.unlinkSync(pidFile);
        fs.closeSync(fd);
        client.emit('perror', [tag, proc.pid, err]);
    });
    return proc;
});
exports.default = runAsProcess;
//# sourceMappingURL=runAsProcess.js.map