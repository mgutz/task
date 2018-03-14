# Tasks

`task` is simple by default and powerful when you need it to be.

# Params and Props

A task is either an exported function or exported object. Each task receives
a single object argument with packages used by `task`

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

* Tasks run once per watch cycle. See `once` and `every` props.
* `task` accepts a single task from command line. Add `deps` to run multiple
  tasks

Task props

| prop    | desc                                                             |
| ------- | ---------------------------------------------------------------- |
| _deps_  | Tasks which must run before current task                         |
| _desc_  | Description to display in task list                              |
| _every_ | Task must run every time it is a dependency                      |
| _once_  | Task must only run once across watches and dependents            |
| _run_   | The function to run.                                             |
| _watch_ | [Glob](https://github.com/micromatch/anymatch) patterns to watch |

```js
export function clean() {}

export const build = {
  desc: 'Builds project',
  deps: [clean],
  run: () => {
    // run build
  },
}
```

### Dependencies Execution

Dependencies can execute in series `[dep1, dep2, ... depN]`, in parallel
`{p: [par1, par2, ... parN]}` or a mixture of

```js
export const foo = {
  // series
  deps: [bar, bah],
}

export const baz = {
  // parallel is object of shape {p: []}
  deps: {p: [bar, bah]},
}

export const mix = {
  // mix of parallel and series
  deps: [bar, {p: [g, h]}, bah, {p: [x, y]}],
}
```

### Set a Default Task

```js
export default build

// OR
export default {
  deps: [build]
}
```

### Watching a Task

A task must have `watch` props of glob patterns to run in watch mode.

```js
export const build = {
  watch: ['src/**.js'],
}
```

Run a task in watch mode: `task build -w`

### Daemons

`task` can gracefully restart daemons in watch mode if a task returns a
[ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess).
For example, to properly restart a node server

```js
export const server = {
  run: ({shawn}) => {
    // this causes port in use errors with other task runners
    return shawn(`node server`)
  },
  watch: ['server/**/*.js'],
}
```

`shawn` is short for shell spawn and handles process groups correctly.
`shawn` executes `/bin/bash -c [script]` by default. `shawn`'s shell, arguments
and other `ChildProcess` options can be overridden.

```js
const shellOpts = {
  shell: '/bin/bash',
  shellArgs: ['-c'],
  env: {
    ...proces.env,
    PORT: '1344',
  },
}

export function server(ctx) {
  return ctx.shawn(`node index.js`, shellOpts)
}
```

## CLI Features

### Babel support

ES6 is the default for any `.js` file. To use plain node to run scripts
use `task --no-babel` flag.

### TypeScript support via Babel

* Name your taskfile: `Taskfile.ts`
* Or force TypeScript flag: `task --ts hello`
* Or specify any file with `.ts` extension: `task -f anyfile.ts hello`
* JavaScript can import any TypeScript with the `--ts` flag

TypeScript type checking is left to the user to keep `task` lean.
Check types with your favorite editor, or from the command line, run `tsc`
with the following `tsconfig.json`, or `tsc -w` to watch for changes:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "pretty": true
    // ...
  }
}
```

## TODO

[ ] Shell Autocompletion (omellete was was terribly slow, suggest another in issues)
