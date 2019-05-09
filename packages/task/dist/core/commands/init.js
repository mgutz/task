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
const exits = require("../exits");
const fp = require("path");
const fs = require("fs");
const util_1 = require("util");
const log_1 = require("../../core/log");
const writeFile = util_1.promisify(fs.writeFile);
exports.run = (ctx) => __awaiter(this, void 0, void 0, function* () {
    const argv = ctx.options;
    const taskfile = argv.typescript ? 'Taskfile.ts' : 'Taskfile.js';
    const taskrcPath = fp.join(process.cwd(), '.taskrc');
    const taskfilePath = fp.join(process.cwd(), taskfile);
    const content = argv.initExample
        ? argv.typescript
            ? typescript
            : javascript
        : empty;
    if (fs.existsSync(taskfilePath)) {
        exits.error(`SKIPPED ${taskfilePath} exists`);
    }
    if (!fs.existsSync(taskrcPath)) {
        fs.writeFileSync(taskrcPath, taskrc, 'utf8');
        log_1.konsole.info('OK .taskrc created');
    }
    return writeFile(taskfilePath, content).then(exits.okFn(`${taskfilePath} created`), exits.errorFn());
});
const empty = ``;
/* eslint-disable max-len */
const javascript = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`;
const typescript = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`;
const taskrc = `
module.exports = {
  // debug: true,
  // file: 'Taskfile.mjs'
}
`;
//# sourceMappingURL=init.js.map