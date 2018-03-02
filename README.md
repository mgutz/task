# task

`task` is a no configuration async task runner from plain es6 files

* .env support
* babel out of the box
* serial and parallel depdencies
* respawn daemons gracefully
* shell autocompletion
* watch

## Install

```sh
npm install -g @mgutz/task@next
```

## Running Tasks

Edit `Taskfile.js`. _Does not need to be inside a node project_

```js
export async function hello({argv}) {
  console.log(`Hello, ${argv.name}!`)
}
```

Run `hello` task from terminal with a name

```sh
task hello --name world
```

Each task receives context with packages already used by `task`

| prop      | desc                                             |
| --------- | ------------------------------------------------ |
| \_        | [lodash](https://lodash.com/docs)                |
| _argv_    | [minimist](https://github.com/substack/minimist) |
| _contrib_ | contrib functions _{shawn}_                      |
| _event_   | Watch event                                      |
| _glob_    | [globby](https://github.com/sindresorhus/globby) |
| _sh_      | [shelljs](http://documentup.com/shelljs/shelljs) |

## Export Metada for More Options

```js
export function build() {}
export function clean() {}
export function generate() {}

export default {
  build: {desc: 'builds project', deps: [clean, generate]},
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

Metadata props

| prop    | desc                                                                 |
| ------- | -------------------------------------------------------------------- |
| _deps_  | Functions which must run before task                                 |
| _desc_  | Description to display in task list                                  |
| _once_  | Task must only run once                                              |
| _run_   | The function to run. May be ignored if key is exported function name |
| _watch_ | [Glob](https://github.com/micromatch/anymatch) patterns to watch     |

## Dependencies Execution

Dependencies can execute in series or parallel

```
export default {
  // series
  foo: ['bar', 'bah'],

  // parallel
  baz: {p: ['a', 'b']},

  mix: ['bar', {p: ['g', 'h']}, 'bah', {p: ['x', 'y']}]
}
```

## Set a Default Task

```js
export default build
```

Or create a pseudo-task named default

```js
export default {
  default: {deps: [build]},
}
```

## Watch Tasks

Watching requires defining glob patterns for a task

```js
export default {
  build: {
    watch: ['src/**/*.js'],
  },
}
```

Run a task in watch mode with `--watch, -w` flag

```sh
task build -w
```

NOTE: `task` can gracefully restart a process (and subprocesses) if a task returns a
[ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess).
`task` provides `contrib.shawn` to run a literal script and return a `ChildProcess`

To properly restart a go http server listening on a port whenever a go file
changes

```js
export function server({contrib}) {
  return contrib.shawn(`
    cd cmd/server
    go install
    server
  `)
}

export default {
  server: {watch: ['server/**/*.go']},
}
```

```sh
task server -w
```

## Running Multiple Tasks

`task` only runs a single task to be consistent with args. To run multiple tasks,
call them directly within a task or add tasks to `deps` prop.

## contrib.shawn

`shawn` is short for shell spawn. `shawn` executes `/bin/bash -c [script]` by
default. The shell and arguments can be overriden

```js
export function server({contrib}) {
  // shawn accepts any child_process.spawn option
  return contrib.shawn(`node index.js`, {
    shell: '/bin/bash',
    shellArgs: ['-c'],
    env: process.env,
  })
}
```

## Auto Completion

Shell auto completion requires editing your shell's rc files. The easiest
solution is by running

```sh
task --setup-completion
```

If you want more control, read [omelette](https://github.com/f/omelette#manual-install)
to manually integrate autocompletion.

## LICENSE

MIT
