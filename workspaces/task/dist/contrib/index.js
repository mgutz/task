"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const defaults = {
    shell: '/bin/bash',
    // '-c' tells bash and sh to run a command string
    shellArgs: ['-c'],
};
/**
 * shawn is short for shell spawns. It defaults to `bin/bash -c`. The options
 * are the same as node's ChildProcess. Additionally, `shell` and `shellArgs`
 * option props can be set to configure the the shell used.
 */
exports.shawn = (script, options = defaults) => {
    const { shell, shellArgs } = options, otherOpts = __rest(options
    // regarding detached, see https://stackoverflow.com/a/33367711
    , ["shell", "shellArgs"]);
    // regarding detached, see https://stackoverflow.com/a/33367711
    const opts = Object.assign({ detached: true, stdio: 'inherit' }, otherOpts);
    // execute the script
    const params = [...shellArgs, script];
    const proc = cp.spawn(shell, params, opts);
    return proc;
};
/**
 * sleep is used to sleep for arbitrary milliseconds.
 */
exports.sleep = (millis) => __awaiter(this, void 0, void 0, function* () { return new Promise((resolve) => setTimeout(resolve, millis)); });
//# sourceMappingURL=index.js.map