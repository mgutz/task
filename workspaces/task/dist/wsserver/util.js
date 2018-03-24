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
const fs = require("fs");
const os = require("os");
const inquirer_1 = require("inquirer");
const log_1 = require("../core/log");
const util_1 = require("../core/util");
const prompt = inquirer_1.createPromptModule();
const exampleTaskproject = `{
  "server": {
	  "storePath": ".tasklogs/{{taskfileId}}/{{taskName}}/{{timestamp}}-{{pid}}"
  },
  "taskfiles": [
    {"id": "Main", "desc":"Main",  "path": "./Taskfile.js", "argv": []}
  ]
}`;
exports.loadProjectFile = (argv, isRunning = false) => __awaiter(this, void 0, void 0, function* () {
    let projectFile = argv.projectFile;
    if (projectFile) {
        if (!fs.existsSync(projectFile)) {
            log_1.konsole.error('Project file not found:', projectFile);
            process.exit(1);
        }
    }
    else {
        projectFile = 'Taskproject.json';
        const exists = fs.existsSync(projectFile);
        if (!exists) {
            if (isRunning) {
                throw new Error(`Project file not found. ${projectFile}`);
            }
            else {
                yield prompt([
                    {
                        default: false,
                        message: `A project file was not found. Create ${projectFile}`,
                        name: 'create',
                        type: 'confirm',
                    },
                ]).then((answers) => {
                    if (!answers.create) {
                        process.exit(0);
                    }
                    fs.writeFileSync(projectFile, exampleTaskproject, 'utf-8');
                });
            }
        }
    }
    const proj = (yield util_1.readJSONFile(projectFile));
    proj.path = projectFile;
    return proj;
});
exports.relativeToHomeDir = (path) => fp.join('~', fp.relative(os.homedir(), fp.resolve(path)));
/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
exports.sanitizeInboundArgv = (argv) => {
    if (_.isEmpty(argv))
        return {};
    // TODO task options need to be separate from CLI options
    //
    // In this example: task foo --help -- --help
    //   foo is the task to run
    //   --help is argument to CLI
    //   -- help is argument to the task to run
    return _.omit(argv, [
        '_',
        'file',
        'help',
        'server',
        'init',
        'initExample',
        'list',
        'projectFile',
    ]);
};
//# sourceMappingURL=util.js.map