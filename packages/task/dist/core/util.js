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
const contrib = require("../contrib");
const fp = require("path");
const fs = require("fs");
const execa = require("execa");
const util_1 = require("util");
const log_1 = require("./log");
const readFileAsync = util_1.promisify(fs.readFile);
exports.appWorkDirectory = fp.resolve(__dirname, '..', '..');
exports.prettify = (o) => util_1.inspect(o);
/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s The string to be parsed.
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
/**
 * Reads JSON file, returning an object.
 *
 * @param filename The JSON file to open.
 */
exports.readJSONFile = (filename) => __awaiter(this, void 0, void 0, function* () {
    const content = yield readFileAsync(filename, 'utf8');
    const [json, err] = exports.safeParseJSON(content);
    if (err)
        throw err;
    return json;
});
exports.taskParam = (argv, additionalProps = {}) => {
    const sh = require('shelljs');
    const globby = require('globby');
    const prompt = require('inquirer').createPromptModule();
    const konsole = log_1.newTerminalLogger();
    const execAsync = (...args) => {
        return new Promise((resolve, reject) => {
            sh.exec(...args, (code, stdout, stderr) => {
                if (code !== 0) {
                    return reject({ code, stdout, stderr });
                }
                return resolve({ code, stdout, stderr });
            });
        });
    };
    return {
        _,
        argv: Object.assign({}, argv, { _: argv._.slice(1) }, additionalProps),
        contrib,
        exec: execAsync,
        execa,
        globby,
        konsole,
        prompt,
        sh,
        shawn: contrib.shawn,
    };
};
/**
 * Returns the full path without dot extension.
 */
exports.trimExtname = (path) => {
    if (!path)
        return '';
    return fp.join(fp.dirname(path), fp.basename(path, fp.extname(path)));
};
//# sourceMappingURL=util.js.map