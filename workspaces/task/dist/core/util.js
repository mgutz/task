"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fp = require("path");
const util_1 = require("util");
exports.appWorkDirectory = fp.resolve(__dirname, '..', '..');
exports.prettify = (o) => util_1.inspect(o);
/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s JSON.stringified object.
 */
exports.safeParseJSON = (s) => {
    try {
        const obj = JSON.parse(s);
        if (_.isPlainObject(obj)) {
            return [obj, null];
        }
        return [null, 'Expected a JSON object'];
    }
    catch (err) {
        return [null, err.message];
    }
};
//# sourceMappingURL=util.js.map