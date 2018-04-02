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
const fs = require("fs");
const os = require("os");
const inquirer_1 = require("inquirer");
const log_1 = require("../core/log");
const util_1 = require("../core/util");
const globby = require("globby");
const util_2 = require("util");
const isRunning = require("is-running");
const readFile = util_2.promisify(fs.readFile);
const existsAsync = util_2.promisify(fs.exists);
const unlink = util_2.promisify(fs.unlink);
const prompt = inquirer_1.createPromptModule();
const exampleTaskproject = `{
  "server": {
  },
  "taskfiles": [
    {"id": "Main", "desc":"Main",  "path": "./Taskfile.js", "argv": []}
  ]
}`;
exports.loadProjectFile = (argv, isAlreadyRunning = false) => __awaiter(this, void 0, void 0, function* () {
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
            if (isAlreadyRunning) {
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
    const proj = (yield util_1.readJSONFile(projectFile));
    proj.path = projectFile;
    return proj;
});
exports.relativeToHomeDir = (path) => fp.join('~', fp.relative(os.homedir(), fp.resolve(path)));
/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
exports.sanitizeInboundArgv = (argv) => {
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
const pidDir = '.pids';
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
// tslint:disable-next-line
const pathPattern = `${pidDir}/{{taskfileId}}/{{taskName}}-{{timestamp}}`;
const logBaseTemplate = _.template(pathPattern);
exports.logBase = (arg) => {
    return logBaseTemplate(arg);
};
const reLogBase = /\/([^\/]+)\/([^\-]+)-([^.]+)(\..+)$/;
const parseLogPath = (path) => __awaiter(this, void 0, void 0, function* () {
    const matches = path.match(reLogBase);
    if (!matches)
        return;
    // export interface ExecInfo {
    //   logFile: string
    //   pid: string
    //   tag: string // history id
    //   taskfileId: string
    //   taskName: string
    //   timestamp: string
    // }
    const info = {
        logFile: path,
        tag: '',
        taskName: matches[2],
        taskfileId: matches[1],
        timestamp: matches[3],
    };
    const pidFile = path.replace(/\.log/, '.pid');
    if (yield existsAsync(pidFile)) {
        const pid = yield readFile(pidFile, 'utf-8');
        if (isRunning(pid)) {
            info.pid = pid;
        }
        else {
            yield unlink(pidFile);
        }
    }
    const tagFile = path.replace(/\.log/, '.tag');
    if (yield existsAsync(tagFile)) {
        const [obj, err] = util_1.safeParseJSON(yield readFile(tagFile, 'utf-8'));
        if (err)
            throw err;
        info.tag = obj;
    }
    return info;
});
exports.getExecHistory = (taskfileId, taskName) => __awaiter(this, void 0, void 0, function* () {
    const files = yield globby([`${pidDir}/${taskfileId}/${taskName}-*.log`]);
    if (!files.length)
        return [];
    const result = [];
    for (const file of files) {
        result.push(yield parseLogPath(file));
    }
    return _.compact(result);
});
exports.formatDate = (d = new Date()) => {
    return (d.getFullYear() +
        '' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '' +
        ('0' + d.getDate()).slice(-2) +
        'T' +
        +('0' + d.getHours()).slice(-2) +
        ('0' + d.getMinutes()).slice(-2) +
        ',' +
        ('00' + d.getMilliseconds()).slice(-3));
};
//# sourceMappingURL=util.js.map