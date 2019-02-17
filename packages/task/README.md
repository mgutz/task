# task

`task` is simple to full-featured async task runner

* es6 task files
* typescript task files
* .env parsing
* parallelized dependencies can speed some tasks
* daemon restarts
* watch mode

## Install

```sh
# to run latest
git clone https://github.com/mgutz/task
cd task
npm link

# to run next, which may be outdated
npm install -g @mgutz/task@next

# stable is not yet available
```

## Help

[Task Manual](docs/tasks.md)

## Quick Start

Edit `Taskfile.js` or `Taskfile.ts`. _Does not need to be inside a node project_

```js
export const sleep = async (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const name = async ({prompt}) => {
  const answers = await prompt([{name: 'name', message: 'Name'}])
  console.log(`Hello, ${answers.name}!`)
}

export const clean = async () => {
  await sleep(1)
  console.log('clean')
}

export const build = {
  deps: [clean],
  run: () => {
    console.log('build')
  },
}

export const arg = ({argv}) => {
  console.log(argv._[0])
}

export const docs = () => {
  console.log('building docs')
}

// use shell spawn (shawn) to gracefully restart daemons
export const server = {
  run: async ({shawn}) => {
    return shawn(`node src/main.js`)
  },
  watch: ['src/**.js'],
}

export default {
  // runs `name` then ['clean', 'build'] and `docs` in parallel
  deps: [name, {p: [build, docs]}],
}
```

To run default: `task`

To invoke arg with an argument: `task arg foo`

To run server in watch mode: `task server -w`

To see which tasks will run: `task build --dry-run`

## Configuration

`task` reads `.taskrc` configuration file. `.taskrc` must be a node compatible
Javascript file. See `Options` in [types](src/@types/globals.d.ts) for available
options (same as command-line)

```js
module.exports = {
  debug: true,
  file: 'Taskfile.mjs',
}
```

`task --init` creates an example `.taskrc`

## GUI

`task --server` starts the GUI in browser (wip)

[GUI Manual](docs/server.md)

## Hacking

[Hacking Manual](docs/hacking.md)

## LICENSE

MIT Licensed

The CLI and server shall forever remain under the MIT License.

Be aware the Task GUI falls under the Affero GPLv3 License.
