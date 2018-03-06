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
npm install -g @mgutz/task@next
```

## Help

[Task Manual](docs/tasks.md)

## Quick Start

Edit `Taskfile.js` or `Taskfile.ts`. _Does not need to be inside a node project_

```js
const sleep = ms => new Promise(resolve => resolve(), ms)

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

## LICENSE

MIT Licensed
