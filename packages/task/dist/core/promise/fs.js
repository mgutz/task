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
const fs = require("fs");
const pify = require("pify");
exports.readFile = pify(fs.readFile);
exports.writeFile = pify(fs.writeFile);
exports.stat = pify(fs.stat);
// Returns a boolean so different than access
exports.canAccess = (filename, mode) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, _reject) => {
        fs.access(filename, mode, (err) => resolve(!Boolean(err)));
    });
});
// Returns true if filename is readable
exports.isReadable = (filename) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, _reject) => {
        fs.access(filename, fs.constants.R_OK, (err) => resolve(!Boolean(err)));
    });
});
// Returns true if filename is writable
exports.isWritable = (filename) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, _reject) => {
        fs.access(filename, fs.constants.W_OK, (err) => resolve(!Boolean(err)));
    });
});
//# sourceMappingURL=fs.js.map