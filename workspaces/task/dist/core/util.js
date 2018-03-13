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
const util_1 = require("util");
const fs = require("fs");
const readFileAsync = util_1.promisify(fs.readFile);
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
exports.readJSONFile = (filename) => __awaiter(this, void 0, void 0, function* () {
    const content = yield readFileAsync(filename, 'utf8');
    const [json, err] = exports.safeParseJSON(content);
    if (err)
        throw err;
    return json;
});
//# sourceMappingURL=util.js.map