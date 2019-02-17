"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
const util_1 = require("util");
const newKonsole = () => {
    const pretty = pino.pretty({
        formatter: (obj) => {
            return obj.msg;
        },
    });
    pretty.pipe(process.stdout);
    return pino({
        name: 'konsole',
    }, pretty);
};
/**
 * Konsole logs to terminal on host.
 */
exports.konsole = newKonsole();
exports.konsole.addLevel('log', 25);
let _level = 'info';
exports.setLevel = (level) => {
    _level = level;
    exports.konsole.level = level;
    _log.level = level;
};
exports.newTerminalLogger = (name = 'konsole') => {
    const logger = pino({
        name,
    });
    logger.addLevel('log', 25);
    return logger;
};
/**
 * Log logs to terminal if task runs in cli mode or through websockets if in
 * server mode.
 */
const _log = exports.newTerminalLogger();
exports.getLogger = () => {
    return _log;
};
exports.trace = (msg, obj) => {
    if (_level !== 'trace') {
        return;
    }
    if (obj === undefined) {
        return _log.debug(msg);
    }
    _log.debug(msg, util_1.inspect(obj));
};
//# sourceMappingURL=log.js.map