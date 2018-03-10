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
const chokidar = require("chokidar");
const globby = require("globby");
const _ = require("lodash");
const log_1 = require("./log");
const util = require("./util");
const defaults = { usePolling: true };
exports.watch = (globs, args, fn, opts = defaults) => __awaiter(this, void 0, void 0, function* () {
    const log = log_1.getLogger();
    const files = yield globby(globs);
    if (files.length < 1) {
        log.warn('No files match watch globs', util.prettify(globs));
    }
    let firstRun = true;
    let message = '';
    let event = {};
    const debounced = _.debounce(() => {
        if (!firstRun) {
            log.info(message);
        }
        const newArgs = Object.assign({}, args, { event });
        fn(newArgs);
        firstRun = false;
    }, 1000, { leading: true, trailing: false });
    return new Promise((resolve, reject) => {
        const watcher = chokidar.watch(globs, Object.assign({}, opts, { ignoreInitial: true }));
        watcher.once('ready', () => {
            log.debug('watching', util.prettify(globs));
            debounced();
            let id = 1;
            const eventHandler = (ev, path) => {
                const idstr = `[${_.padStart(String(id++), 2, '0')}]`;
                message = `\n${idstr} ${ev.toUpperCase()} ${path}`;
                event = { event: ev, path };
                debounced();
            };
            watcher.on('all', eventHandler);
        });
        watcher.once('error', (err) => {
            log.error(`Watcher error ${err}`);
            reject(err);
        });
    });
});
//# sourceMappingURL=watch.js.map