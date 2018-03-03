# task

`task` is a no configuration async task runner

* es6 task files
* command line arguments
* typescript
* .env parsing
* serial and parallel dependencies
* graceful daemon restarts
* shell autocompletion
* watch

## Install

```sh
npm install -g @mgutz/task@next
```

## Running Tasks

Edit `Taskfile.js` or `Taskfile.ts`. _Does not need to be inside a node project_

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

## Export Metada for Typical Task Runner Options

> `task` accepts a single task from command line. To run multiple tasks, add `deps`
> with multiple tasks.

```js
export function build() {}
export function clean() {}
export function generate() {}
export function css() {}

export default {
  build: {
    desc: 'builds project',
    deps: [clean, {p: [generate, css]}], // serial and parallel execution
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

Metadata props

| prop    | desc                                                                 |
| ------- | -------------------------------------------------------------------- |
| _deps_  | Functions which must run before task                                 |
| _desc_  | Description to display in task list                                  |
| _once_  | Task must only run once                                              |
| _run_   | The function to run. May be ignored if key is exported function name |
| _watch_ | [Glob](https://github.com/micromatch/anymatch) patterns to watch     |

### Babel and Typescript Support

* Name your taskfile: `Taskfile.ts`
* Or, force typescript flag: `task --ts Taskfile hello`
* Or, specify any file with `.ts` extension: `task -f anyfile.ts hello`

ES6 is the default for any `.js` file. To use current node to run scripts
directly use `task --no-babel` flag.

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

Run a task in watch mode with `--watch, -w` flag

```sh
task build -w
```

Watch requires defining `watch` glob patterns

```js
export default {
  build: {
    watch: ['src/**/*.js'],
  },
}
```

`task` can gracefully restart daemons if a task returns a
[ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess).
For example, to properly restart a node server listening on a specific port whenever a
a file changes

```js
export default {
  server: {
    run: ({contrib}) => {
      // this causes port in use errors with other task runners
      return contrib.shawn(`
        PORT=1324 node server
      `)
    },
    watch: ['server/**/*.go'],
  },
}
```

`shawn` is short for shell spawn. `shawn` executes `/bin/bash -c [script]` by
default. The shell, arguments and other ChildProcess options can be overridden.

```js
const shellOpts = {
  shell: '/bin/sh',
  shellArgs: ['-c'],
  env: {
    PORT: '1344',
  },
}

export function server({contrib}) {
  return contrib.shawn(`node index.js`, shellOpts)
}
```

## Auto Completion

Note: autocompletion is terribly slow. Will be replacing `omelette` in the future

Shell auto completion requires editing your shell's rc files. The easiest
solution is by running then restarting your terminal

```sh
task --setup-completion
```

If you want more control, read [omelette](https://github.com/f/omelette#manual-install)
to manually integrate autocompletion.

## LICENSE

MIT
