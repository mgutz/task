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
const dotenv = require("dotenv");
const exits = require("../core/exits");
const fp = require("path");
const fs = require("fs");
const server = require("../wsserver");
const terminal = require("./terminal");
const tasks_1 = require("../core/tasks");
const options_1 = require("./options");
const log_1 = require("../core/log");
const AppContext_1 = require("../core/AppContext");
const compile_1 = require("./compile");
const init_1 = require("../core/commands/init");
const util_1 = require("../core/util");
const loadTaskrc = (workDir) => {
    const taskrc = fp.join(workDir, '.taskrc');
    if (fs.existsSync(taskrc)) {
        const obj = require(taskrc);
        if (obj.file && !fs.existsSync(fp.join(workDir, obj.file))) {
            exits.error(`File specified in ${taskrc} not found: ${obj.file}`);
        }
        return obj;
    }
    return {};
};
const setLogLevel = (argv) => {
    if (argv.silent) {
        log_1.setLevel('silent');
    }
    else if (argv.trace) {
        log_1.setLevel('trace');
    }
    else if (argv.debug) {
        log_1.setLevel('debug');
    }
    else {
        log_1.setLevel('info');
    }
};
const loadOptions = () => {
    let argv;
    // when task is spawned by server, it passes in options through environment
    // variable
    if (process.env.task_ipc_options) {
        const [argv2, err] = util_1.safeParseJSON(process.env.task_ipc_options);
        if (err) {
            // @ts-ignore, exits the app
            return exits.error(err);
        }
        argv = argv2;
        delete process.env.task_ipc_options;
        return argv;
    }
    // load taskrc early
    const taskrc = loadTaskrc(process.cwd());
    return options_1.parseArgv(process.argv.slice(2), taskrc);
};
// if the first arg has a known extension, use it as the task file
const setFileOnFirstArgExt = (argv) => {
    if (argv._.length) {
        const firstArg = argv._[0];
        const dotExt = fp.extname(firstArg);
        if (dotExt && argv.babelExtensions.indexOf(dotExt) > -1) {
            argv.file = firstArg;
            // remove file from argv
            argv._.shift();
        }
    }
};
const main = () => __awaiter(this, void 0, void 0, function* () {
    const argv = loadOptions();
    if (argv.help) {
        return exits.message(options_1.helpScreen());
    }
    setLogLevel(argv);
    setFileOnFirstArgExt(argv);
    const taskfilePath = tasks_1.findTaskfile(argv);
    if (!taskfilePath) {
        if (argv.file) {
            exits.error(`Tasks file not found: ${argv.file}`);
            return null;
        }
        return exits.message(options_1.helpScreen());
    }
    const filename = yield compile_1.build(argv, taskfilePath);
    const tasks = yield tasks_1.loadTasks(argv, filename);
    if (!tasks) {
        return exits.error(`Cannot load tasks from: ${taskfilePath}`);
    }
    if (argv.dotenv) {
        dotenv.config();
    }
    if (argv.list) {
        return exits.message(options_1.tasksScreen(tasks));
    }
    const ctx = new AppContext_1.AppContext(tasks, argv, log_1.konsole);
    if (argv.init || argv.initExample) {
        return yield init_1.run(ctx);
    }
    if (argv.server) {
        return server.run(ctx);
    }
    ctx.log = log_1.newTerminalLogger();
    return terminal.run(ctx);
});
main();
//# sourceMappingURL=main.js.map