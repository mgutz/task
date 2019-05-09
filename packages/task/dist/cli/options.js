"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const columnify = require("columnify");
const yargs = require("yargs-parser");
// tslint:disable-next-line
const pkgJson = require('../../package.json');
const argvParserOpts = {
    alias: {
        babelExtensions: ['babel-extensions'],
        debug: ['verbose'],
        dryRun: ['dry-run'],
        file: ['f'],
        help: ['?'],
        initExample: ['init-example'],
        projectFile: ['project-file', 'p'],
        typescript: ['ts'],
        watch: ['w'],
    },
    boolean: [
        '?',
        'babel',
        'compile',
        'debug',
        'dotenv',
        'dry-run',
        'dryRun',
        'server',
        'help',
        'init',
        'init-example',
        'initExample',
        'list',
        'p',
        'pretty',
        'project-file',
        'projectFile',
        'silent',
        'trace',
        'ts',
        'typescript',
        'verbose',
        'w',
        'watch',
    ],
    default: {
        babel: true,
        babelExtensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
        compile: false,
        dotenv: true,
        file: '',
    },
    string: ['f', 'file', 'babelExtensions', 'projectFile'],
};
exports.parseArgv = (argv, defaultOverrides = {}) => {
    return yargs(argv, Object.assign({}, argvParserOpts, { default: Object.assign({}, argvParserOpts.default, defaultOverrides) }));
};
exports.helpScreen = () => {
    return `${pkgJson.name} v${pkgJson.version} - no config task runner

Usage: task [options] [task] [task_options...]

Options
  --compile           Force the task file to be compiled
  --debug,--verbose   Debug logging
  --dry-run           Displays tasks that will run
  --file,-f           Task file
  --init              Create empty Taskfile.js if not exists
  --init-example      Create example Taskfile.js if not exists
  --list              List tasks
  --no-dotenv         Do not parse .env file
  --project-file,-p   Project file used by server (./Taskproject.json)
  --server               Run GUI server. Browse http://localhost:4200
  --silent            No output
  --trace             More verbose logging
  --typescript,--ts   Force typescript
  --watch,-w          Watch mode
  --help,-?           Display this screen

Advanced options
  --babel-extensions  File extensions that babel should process when requiring.
                      Default ['.js','.jsx','.es6','.es','.mjs','.ts','.tsx']

Configuration File .taskrc
    module.exports = {
      "babel-extensions": ['.js','.es6','.es','.mjs'],
      file: 'Taskfile.es7'
    }

Quick Start
  1) Edit Taskfile.js
       export async function hello({argv}) {
         console.log('Hello, \${argv.name}!')
       }

  2) Run hello
       task hello --name foo

Examples
  task
    Runs default task

  task hello world
    Runs task 'hello' with argv = {_: ['world']}

  task hello --name world
    Runs task 'hello' with argv = {name: 'world'}

  task hello --dry-run
    Print the sequence of tasks that run up to and including hello

  task otherTaskFile.js hello world
    If first arg is a file that ends with {.js,.ts}, use it as the task file
    without requiring --file

  task hello world --trace
    Prints detailed internal diagnostics while task executes. --debug prints
    less information.
`;
};
const taskList = (tasks) => {
    const taskArray = Object.values(tasks);
    if (!taskArray || taskArray.length < 1) {
        return 'No tasks found.';
    }
    const indent = '  ';
    const items = _.sortBy(taskArray, 'name')
        .map((it) => ({
        desc: it.desc,
        name: it.name,
    }))
        .filter((it) => it.desc);
    return columnify(items, {
        columnSplitter: '  ',
        columns: ['name', 'desc'],
        showHeaders: false,
    }).replace(/^/gm, indent);
};
exports.usage = (tasks) => {
    return Object.keys(tasks).length ? exports.tasksScreen(tasks) : exports.helpScreen();
};
exports.tasksScreen = (tasks) => {
    return `task v${pkgJson.version}

Usage: task [options] [task] [task_options...]

Options
  --help,-?  Print all options

Tasks
${taskList(tasks)}
`;
};
//# sourceMappingURL=options.js.map