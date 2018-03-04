# task

`task` is zero to full configuration async task runner

* es6 task files
* typescript task files
* .env parsing
* serial and parallel dependencies
* daemon restarts
* shell autocompletion
* watch mode

## Install

```sh
npm install -g @mgutz/task@next
```

## Zero Configuration

Edit `Taskfile.js` or `Taskfile.ts`. _Does not need to be inside a node project_

```js
export async function hello({argv}) {
  console.log(`Hello, ${argv.name}!`)
}
```

In a terminal, run

```sh
task hello --name world
```

## Tasks

### Task Run-Time Argument

Each task receives an arg with packages already used by `task` itself

| prop      | desc                                                    |
| --------- | ------------------------------------------------------- |
| \_        | [lodash](https://lodash.com/docs)                       |
| _argv_    | [minimist](https://github.com/substack/minimist)        |
| _contrib_ | contrib functions _{shawn}_                             |
| _exec_    | Promisified `sh.exec` resolves `{code, stderr, stdout}` |
| _event_   | Watch event                                             |
| _globby_  | [globby](https://github.com/sindresorhus/globby)        |
| _sh_      | [shelljs](http://documentup.com/shelljs/shelljs)        |
| _shawn_   | Shell spawn returning ChildProcess                      |

### Full Configuration

`task` is simple by default and powerful when you need it to be.

* Tasks run once per run. See `once` and `every` props.
* `task` accepts a single task from command line. To run multiple tasks,
  add `deps`

Task props

| prop    | desc                                                             |
| ------- | ---------------------------------------------------------------- |
| _deps_  | Tasks which must run before current task                         |
| _desc_  | Description to display in task list                              |
| _once_  | Task must only run once across watches and dependents            |
| _every_ | Task must run every time it is a dependency                      |
| _run_   | The function or ref to run.                                      |
| _watch_ | [Glob](https://github.com/micromatch/anymatch) patterns to watch |

```js
export function build() {}
export function clean() {}
export function generate() {}
export function css() {}

export default {
  build: {
    desc: 'builds project',
    deps: [clean, {p: [generate, css]}], // serial and parallel execution
    run: build,
  },
}
```

Alternatively,

```js
export default {
  build: {desc: 'builds project', run: () => {}, deps: ['clean', 'generate']},
  clean: {desc: 'cleans project', run: () => {}},
  generate: {desc: 'generates code', run: () => {}},
}
```

### Set a Default Task

```js
export default build
```

Or create a pseudo-task named default

```js
export default {
  default: {deps: [build]},
}
```

### Dependencies Execution

Dependencies can execute in series, parallel or a mix

```js
export default {
  // series
  foo: ['bar', 'bah'],

  // parallel
  baz: {p: ['a', 'b']},

  mix: ['bar', {p: ['g', 'h']}, 'bah', {p: ['x', 'y']}],
}
```

### Watching Tasks

Run a task in watch mode: `task build -w`

Watch requires defining `watch` glob patterns

```js
export default {
  build: {
    watch: ['src/**/*.js'],
  },
}
```

#### Daemons

`task` can gracefully restart daemons in watch mode if a task returns a
[ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess).
For example, to properly restart a node server

```js
export default {
  server: {
    run: ({shawn}) => {
      // this causes port in use errors with other task runners
      return shawn(`
        node server
      `)
    },
    watch: ['server/**/*.js'],
  },
}
```

`shawn` is short for shell spawn and handles process groups correctly.
`shawn` executes `/bin/bash -c [script]` by default. Shell, arguments and other
`ChildProcess` options can be overridden.

```js
const shellOpts = {
  shell: '/bin/bash',
  shellArgs: ['-c'],
  env: {
    ...proces.env,
    PORT: '1344',
  },
}

export function server({shawn}) {
  return shawn(`node index.js`, shellOpts)
}
```

## CLI Features

### Babel and Typescript Support

* Name your taskfile: `Taskfile.ts`
* Or, force typescript flag: `task --ts Taskfile hello`
* Or, specify any file with `.ts` extension: `task -f anyfile.ts hello`

ES6 is the default for any `.js` file. To use plain node to run scripts
use `task --no-babel` flag.

### Auto Completion

Note: autocompletion is terribly slow. Need to replace `omelette`

Shell auto completion requires editing your shell's rc files. The easiest
solution is by running the command below then restarting your terminal

```sh
task --setup-completion
```

Read [omelette](https://github.com/f/omelette#manual-install) to manually
integrate with your shell.

## LICENSE

MIT
