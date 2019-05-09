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
const fp = require("path");
const pkgUp = require("pkg-up");
const rollup = require("rollup");
const fs_1 = require("../core/promise/fs");
const log_1 = require("../core/log");
const tempFile = (_argv, taskfile) => {
    const dir = fp.dirname(taskfile);
    const base = '.tasktmp-' + fp.basename(taskfile, fp.extname(taskfile));
    return { dir, base };
};
const compiledFile = (argv, taskfile) => {
    const { dir, base } = tempFile(argv, taskfile);
    return fp.join(dir, base + '.js');
};
// Determines whether the task file should be recompiled by rollup. This is
// not robust! It only checks the current task file, compiled file and
// package.json for changes. Anything imported locally is not considered. In
// those cases, task can be forced to recompile with `--compile` flag.
exports.shouldCompile = (argv, taskfilePath) => __awaiter(this, void 0, void 0, function* () {
    const compileFile = compiledFile(argv, taskfilePath);
    if (!(yield fs_1.isReadable(compileFile))) {
        log_1.trace('Compile file not readable', compileFile);
        return true;
    }
    const statTaskFile = yield fs_1.stat(taskfilePath);
    const statCompileFile = yield fs_1.stat(compileFile);
    if (statTaskFile.mtime > statCompileFile.mtime) {
        log_1.trace('Task file is newer than compile file', compileFile);
        return true;
    }
    const nearestPackageFile = yield pkgUp();
    const statPackageFile = yield fs_1.stat(nearestPackageFile);
    if (statCompileFile.mtime < statPackageFile.mtime) {
        log_1.trace('Compile file is older than package file', {
            compileFile,
            nearestPackageFile,
        });
        return true;
    }
    return false;
});
/**
 * Build conditionally builds the task file. The task file is rebuilt when
 *
 * - --compile flag is set on CLI
 * - compiled file does not exist
 * - task file is newer than compiled file
 * - compiled file is older than nearest package file
 */
exports.build = (argv, taskfilePath) => __awaiter(this, void 0, void 0, function* () {
    const { dir, base } = tempFile(argv, taskfilePath);
    const compileFile = compiledFile(argv, taskfilePath);
    const isCompile = argv.compile || (yield exports.shouldCompile(argv, taskfilePath));
    if (isCompile) {
        const relative = (path) => fp.relative(dir, path);
        log_1.trace(`Compiling ${relative(taskfilePath)} to ${relative(compileFile)}`);
        const bundle = yield rollup.rollup({
            input: { [base]: taskfilePath },
            plugins: [],
        });
        yield bundle.write({ dir, format: 'cjs' });
    }
    else {
        log_1.trace('Skipping up-to-date', compileFile);
    }
    return compileFile;
});
//# sourceMappingURL=compile.js.map