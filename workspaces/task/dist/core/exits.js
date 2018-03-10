"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
/* eslint-disable no-console */
exports.error = (err, code = 1) => {
    log_1.konsole.error(err);
    process.exit(code);
};
exports.errorFn = (code = 1) => (err) => {
    exports.error(err, code);
};
exports.ok = (msg) => {
    log_1.konsole.info(msg ? `OK ${msg}` : 'OK');
    process.exit(0);
};
exports.okFn = (msg = '') => () => {
    exports.ok(msg);
};
exports.message = (msg, code = 0) => {
    log_1.konsole.info(msg);
    process.exit(code);
};
//# sourceMappingURL=exits.js.map