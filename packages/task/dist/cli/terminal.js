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
const exits = require("../core/exits");
const runner_1 = require("../core/runner");
const tasks_1 = require("../core/tasks");
const options_1 = require("./options");
exports.run = (ctx) => __awaiter(this, void 0, void 0, function* () {
    const { options, tasks } = ctx;
    const taskName = taskToRun(options);
    if (!taskName && !tasks_1.runnableRef(tasks, 'default')) {
        exits.message(options_1.usage(tasks));
    }
    const name = tasks_1.runnableRef(tasks, taskName || 'default');
    if (!name) {
        exits.error(`Task not found: ${options._[0]}`);
    }
    if (options.watch) {
        return runner_1.runThenWatch(ctx, name).then(exits.okFn(), exits.errorFn());
    }
    return runner_1.run(ctx, name).then(exits.okFn(), exits.errorFn());
});
const taskToRun = (argv) => {
    return argv._[0];
};
//# sourceMappingURL=terminal.js.map