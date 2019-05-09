"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.parallelTask = (task) => task && task._parallel && task.deps;
exports.serialTask = (task) => task && Array.isArray(task.deps);
exports.childProcess = (v) => v && typeof v.kill === 'function';
exports.promise = (v) => v && typeof v.then === 'function';
exports.runnable = (task) => {
    return task && (typeof task.run === 'function' || Array.isArray(task.deps));
};
exports.object = (o) => _.isObject(o);
// {p: [dep1, dep2]}
// const isParallel = (dep: any): boolean => dep && Array.isArray(dep.p)
//# sourceMappingURL=iss.js.map