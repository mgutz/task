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
const inquirer_1 = require("inquirer");
const log_1 = require("../core/log");
const util_1 = require("../core/util");
const prompt = inquirer_1.createPromptModule();
const taskScript = fp.resolve(__dirname, '..', '..', 'index.js');
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
exports.runAsProcess = (taskfileId, taskName, argv, client) => {
    argv._[0] = taskName;
    argv.gui = false;
    const newArgv = _.pick(argv, [
        '_',
        'babel',
        'debug',
        'dotenv',
        'file',
        'dryRun',
        'silent',
        'trace',
        'typescript',
        'watch',
        'babelExtensions',
        'name',
    ]);
    const argvstr = JSON.stringify(newArgv);
    const opts = {
        cwd: fp.dirname(argv.file),
        detached: true,
        env: Object.assign({}, process.env, { task_ipc_options: argvstr }),
    };
    // execute the script
    const params = [taskScript];
    console.log('???????DBG:PARAMS', params);
    console.log('???????DBG:ARGV', argvstr);
    const proc = cp.spawn('node', params, opts);
    proc.stdout.setEncoding('utf-8');
    proc.stdout.on('data', (data) => {
        console.log('pout', data);
        client.send('pout', [taskfileId, taskName, proc.pid, data]);
    });
    proc.stderr.setEncoding('utf-8');
    proc.stderr.on('data', (data) => {
        console.log('perr', data);
        client.send('perr', [taskfileId, taskName, proc.pid, data]);
    });
    proc.on('close', (code) => {
        console.log('pclose', code);
        client.send('pclose', [taskfileId, taskName, proc.pid, code]);
    });
    proc.on('error', (err) => {
        console.log('pclose', err);
        client.send('perror', [taskfileId, taskName, proc.pid, err]);
    });
    return proc;
};
const exampleTaskproject = `
{
  "Taskfiles": []
}
`;
exports.loadProjectFile = (argv, isRunning = false) => __awaiter(this, void 0, void 0, function* () {
    let projectFile = argv.projectFile;
    if (projectFile) {
        if (!fs.existsSync(projectFile)) {
            log_1.konsole.error('Project file not found:', projectFile);
            process.exit(1);
        }
    }
    else {
        projectFile = 'Taskproject.json';
        const exists = fs.existsSync(projectFile);
        if (!exists) {
            if (isRunning) {
                throw new Error(`Project file not found. ${projectFile}`);
            }
            else {
                yield prompt([
                    {
                        default: false,
                        message: `A project file was not found. Create ${projectFile}`,
                        name: 'create',
                        type: 'confirm',
                    },
                ]).then((answers) => {
                    if (!answers.create) {
                        process.exit(0);
                    }
                    fs.writeFileSync(projectFile, exampleTaskproject, 'utf-8');
                });
            }
        }
    }
    return util_1.readJSONFile(projectFile);
});
//# sourceMappingURL=util.js.map