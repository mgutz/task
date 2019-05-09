"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
const stringify = require("stringify-object");
// Options for stringifying an object. The body of functions are too noisy
// Convert functions to 'Function' and 'AsyncFunction'
const stringifyOpts = {
    indent: '  ',
    transform: (obj, prop, originalResult) => {
        if (typeof obj[prop] === 'function') {
            if (originalResult.startsWith('async')) {
                return 'AsyncFunction';
            }
            return 'Function';
        }
        return originalResult;
    },
};
exports.newTerminalLogger = (name = 'default', opts = {}) => {
    const logger = pino(Object.assign({ 
        // @ts-ignore
        customLevels: {
            log: 25,
        }, name, prettyPrint: process.stdout.isTTY }, opts));
    return logger;
};
/**
 * PlainPrettier is a simple prettifier to display messages and optionally color
 * the logline based on the level. Colors are disabled if --no-colors is set.
 *
 * @param options is passed in by pino.
 */
exports.plainPrettifier = (options) => {
    const { messageKey } = options;
    const isObject = (input) => {
        return Object.prototype.toString.apply(input) === '[object Object]';
    };
    const isPinoLog = (log) => {
        return log && (log.hasOwnProperty('v') && log.v === 1);
    };
    // Deal with whatever options are supplied.
    return (inputData) => {
        if (typeof inputData === 'string') {
            return inputData;
        }
        else if (isObject(inputData) && isPinoLog(inputData)) {
            return inputData[messageKey];
        }
        return undefined;
    };
};
/**
 * Konsole is used for interactive terminals. It should not be JSON.
 */
exports.konsole = exports.newTerminalLogger('konsole', {
    prettifier: exports.plainPrettifier,
    prettyPrint: true,
});
let _level = 'info';
exports.setLevel = (level) => {
    _level = level;
    exports.konsole.level = level;
    _log.level = level;
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
        _log.debug(msg);
        return;
    }
    _log.debug(msg, stringify(obj, stringifyOpts));
};
//# sourceMappingURL=log.js.map