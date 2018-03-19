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
const fp = require("path");
const log_1 = require("../core/log");
const util_1 = require("../core/util");
exports.importPackageTasks = (dir, prefix = 'npm_') => __awaiter(this, void 0, void 0, function* () {
    const path = fp.join(dir, 'package.json');
    if (!fs.existsSync(path)) {
        log_1.konsole.error('package.json not found');
        return;
    }
    const o = yield util_1.readJSONFile(path);
    if (o.scripts) {
        const tasks = [];
        for (const k in o.scripts) {
            const script = o.scripts[k];
            tasks.push({
                name: prefix + k,
                run: ({ sh }) => {
                    return sh.exec(script);
                },
            });
        }
        return tasks;
    }
});
//# sourceMappingURL=importNpm.js.map