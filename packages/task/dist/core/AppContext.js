"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
class AppContext {
    constructor(tasks, options, konsole // Always logs to host's console
    ) {
        this.tasks = tasks;
        this.options = options;
        this.konsole = konsole;
        this.log = log_1.newTerminalLogger();
    }
}
exports.AppContext = AppContext;
//# sourceMappingURL=AppContext.js.map