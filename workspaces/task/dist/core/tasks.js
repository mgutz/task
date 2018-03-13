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
const exits = require("./exits");
const fp = require("path");
const fs = require("fs");
const iss = require("./iss");
const util_1 = require("./util");
const log_1 = require("./log");
// Standardize differences between es6 exports and commonJs exports. Code
// assumes es6 from user taskfiles.
const standardizeExports = (argv, taskFile) => {
    if (!argv.babel && typeof taskFile === 'function') {
        return {
            default: taskFile,
            [taskFile.name]: {
                _original: taskFile,
                run: taskFile,
            },
        };
    }
    return taskFile;
};
// {p: [dep1, dep2]}
const isParallel = (dep) => dep && Array.isArray(dep.p);
// [dep1, dep2]
const isSerial = (dep) => Array.isArray(dep);
const isDep = (dep) => isParallel(dep) || isSerial(dep);
exports.runnableRef = (tasks, ref) => {
    const task = tasks[ref];
    return iss.runnable(task) ? ref : '';
};
const isTaskMeta = (task) => task && (task.desc || task.deps || task.every || task.once || task.watch);
/**
 * [a, b, {p: [d, e, {p: [x, y]}]}] becomes
 *
 * ['a', 'b', 'p_1']
 * p_1 : {
 *  deps: ['d', 'e', 'p_2'],
 *  _parallel: true
 * },
 * p_2: {
 *  deps: ['x', 'y'],
 *  _parallel: true
 * }
 */
const standardizeDeps = (tasks, task, deps) => {
    if (!isDep(deps)) {
        return null;
    }
    const result = [];
    let name;
    if (isSerial(deps)) {
        for (const dep of deps) {
            name = exports.depToRef(tasks, task, dep);
            if (name) {
                result.push(name);
            }
        }
    }
    else if (isParallel(deps)) {
        name = exports.makeParallelRef(tasks, task, deps);
        if (name) {
            result.push(name);
        }
    }
    return result.length ? result : null;
};
exports.addSeriesRef = (tasks, task, deps) => {
    const name = uniqueName('s');
    tasks[name] = { name, deps };
    return name;
};
exports.makeParallelRef = (tasks, task, dep) => {
    const name = uniqueName('p');
    const tsk = {
        _parallel: true,
        name,
    };
    tasks[name] = tsk;
    // if an array exists in parallel deps then we need to create a series ref
    // to treat it as one unit otherwise each dep runs parallelized
    const deps = Array.isArray(dep.p) &&
        dep.p.map((it) => {
            if (Array.isArray(it)) {
                return exports.addSeriesRef(tasks, task, it);
            }
            return it;
        });
    tsk.deps = standardizeDeps(tasks, tsk, deps) || [];
    tsk.desc = `Run ${task.name}`;
    return name;
};
const makeAnonymousRef = (tasks, fn) => {
    if (fn.name && tasks[fn.name]) {
        return fn.name;
    }
    const name = uniqueName('a');
    tasks[name] = {
        name,
        run: fn,
    };
    return name;
};
const makeFunctionTask = (tasks, key, fn) => {
    if (fn.name || key) {
        return {
            name: fn.name || key,
            run: fn,
        };
    }
    // anonymous functions need to be in tasks too
    return {
        name: uniqueName('a'),
        run: fn,
    };
};
exports.depToRef = (tasks, task, dep) => {
    const log = log_1.getLogger();
    if (!dep) {
        return null;
    }
    let name;
    if (_.isString(dep)) {
        name = dep;
    }
    else if (typeof dep === 'function') {
        name = makeAnonymousRef(tasks, dep);
    }
    else if (isParallel(dep)) {
        name = exports.makeParallelRef(tasks, task, dep);
    }
    else if (iss.runnable(dep)) {
        // reference to an object
        const key = _.findKey(tasks, (o) => o._original === dep);
        if (key) {
            name = key;
        }
        else {
            log.Error(`Can't match object reference`, { task, dep });
            return null;
        }
    }
    else {
        log.error(`Dependency type is not handled`, { task, dep });
        return null;
    }
    if (!tasks[name]) {
        exits.error(`Task ${task.name} has invalid ${name} dependency`);
    }
    return name;
};
const taskfileJs = 'Taskfile.js';
const taskfileTs = 'Taskfile.ts';
exports.findTaskfile = (argv) => {
    const log = log_1.getLogger();
    const filename = argv.file;
    const testFilename = (path) => {
        const absolute = fp.join(process.cwd(), path);
        log.debug(`Trying task file: ${absolute}`);
        return fs.existsSync(absolute) ? absolute : null;
    };
    if (filename) {
        return testFilename(filename);
    }
    let fname = testFilename(taskfileJs);
    if (fname) {
        return fname;
    }
    fname = testFilename(taskfileTs);
    if (fname) {
        return fname;
    }
    return null;
};
/**
 * Use task's built-in babel.
 */
exports.configureBabel = (argv, taskfilePath) => {
    const dotext = fp.extname(taskfilePath) || '.js';
    const isTypeScript = argv.typescript || dotext === '.ts';
    if (!argv.babel && !isTypeScript) {
        return;
    }
    const log = log_1.getLogger();
    const usingMsg = isTypeScript
        ? 'Using @babel/preset-typescript for TypeScript'
        : 'Using @babel/preset-env for ES6';
    log.debug(usingMsg);
    const extensions = [...argv.babelExtensions];
    if (extensions.indexOf(dotext) === -1) {
        extensions.push(dotext);
    }
    const babelPresetEnvPath = fp.join(util_1.appWorkDirectory, 'node_modules', '@babel', 'preset-env');
    const babelPresetTypeScriptPath = fp.join(util_1.appWorkDirectory, 'node_modules', '@babel', 'preset-typescript');
    const babelRegisterPath = fp.join(util_1.appWorkDirectory, 'node_modules', '@babel', 'register');
    // MUST use full path or babel tries to load @babel/preset-env relative to cwd
    const babelrc = {
        extensions,
        presets: _.compact([
            [babelPresetEnvPath, { targets: { node: 'current' } }],
            isTypeScript ? babelPresetTypeScriptPath : null,
        ]),
    };
    require(babelRegisterPath)(babelrc);
};
/**
 * Loads and standardize tasks.
 *
 * type task struct {
 *  deps []string
 *  desc string
 *  every bool
 *  name string
 *  once bool
 *  run function
 *  _parallel bool
 *  _ran bool       // whether task ran on current watch change
 * }
 */
exports.loadTasks = (argv, taskfilePath) => __awaiter(this, void 0, void 0, function* () {
    if (!taskfilePath) {
        return null;
    }
    exports.configureBabel(argv, taskfilePath);
    const log = log_1.getLogger();
    log.debug(`Loading "${fp.resolve(taskfilePath)}"`);
    log.debug('cwd', process.cwd());
    const taskfileExports = require(fp.resolve(taskfilePath));
    log_1.trace('Raw taskfile\n', taskfileExports);
    const taskfile = standardizeExports(argv, taskfileExports);
    log_1.trace('Standardized as ES6\n', taskfile);
    const tasks = exports.standardizeFile(taskfile);
    log_1.trace('Tasks after standardizing functions and objects\n', tasks);
    // standardize dependencies
    // tslint:disable-next-line
    for (const name in tasks) {
        const task = tasks[name];
        // deps come in as function variables, convert to name references
        // for depedency resolution
        const deps = standardizeDeps(tasks, task, task.deps);
        if (deps) {
            task.deps = deps;
        }
    }
    log_1.trace('Tasks after standardizing deps\n', tasks);
    // standardizing deps can create anonymous tasks for dep-only tasks
    // tslint:disable-next-line
    for (const name in tasks) {
        const task = tasks[name];
        if (task.desc) {
            continue;
        }
        const desc = task.deps
            ? `Run ${task.deps.join(', ')}${task.run ? ', ' + task.name : ''}`
            : task.run ? `Run ${task.name}` : '';
        task.desc = desc;
    }
    log_1.trace('Tasks after standardizing desc\n', tasks);
    return tasks;
});
// standardizes a task file's task.
exports.standardizeFile = (v) => {
    const tasks = {};
    const assignTask = (key, taskdef) => {
        const task = exports.standardizeTask(tasks, key, taskdef);
        if (!task) {
            throw new Error(`Does not resolve to task: ${util_1.prettify(taskdef)}`);
        }
        tasks[key] = task;
    };
    if (_.isObject(v)) {
        // convert exported default object
        // tslint:disable-next-line
        for (const name in v) {
            assignTask(name, v[name]);
        }
        return tasks;
    }
    assignTask('', v);
    return tasks;
};
exports.standardizeTask = (tasks, k, v) => {
    if (typeof v === 'function') {
        return makeFunctionTask(tasks, k, v);
    }
    else if (iss.runnable(v) || isTaskMeta(v)) {
        // we also need to track original object to compare object references
        const existing = tasks[k];
        return Object.assign({ _original: v }, existing, v, { name: k });
    }
    else {
        throw new Error(`Tasks must be a function or task object: ${util_1.prettify({ [k]: v })}`);
    }
};
let _nameId = 0;
const uniqueName = (prefix) => {
    _nameId++;
    // a=anonymous p=parallel s=serial
    return `${prefix}_${_nameId}`;
};
//# sourceMappingURL=tasks.js.map