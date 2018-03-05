# task

`task` is simple to full-featured async task runner

* es6 task files
* typescript task files
* .env parsing
* serial and parallel dependencies
* daemon restarts
* watch mode

[Manual](docs/tasks.md)

## Install

```sh
npm install -g @mgutz/task@next
```

## Quick Start

Edit `Taskfile.js` or `Taskfile.ts`. _Does not need to be inside a node project_

```js
const version = require('package.json').version

// argv is already parsed
export const hello = ctx => {
  console.log(`Hello, ${ctx.argv.name || 'world'}!`)
}

// simple tasks are exported functions
export const clean = ({sh}) => {
  sh.rm('-rf', 'build')
}

// complex tasks are exported objects
export const build = {
  deps: [clean],
  run: async ({exec}) => {
    return exec(`
      sleep 1
      echo building...
    `)
  },
}

export const copyAssets = ({sh}) => {
  sh.mkdir('-rf', `build/public/${version}`)
  sh.cp('-rf', 'public/*', `build/public/${version}`)
}

// run deps in parallel, `clean` will get automatically get called before
// the parallel unit
export const tar = {
  deps: {p: [build, copyAssets]},
  run: ({sh}) => {
    sh.exec(`echo archiving app-${version}.tgz`)
  },
}

export const server = {
  deps: [build],
  run: ({shawn}) => {
    return shawn(`node build/main.js`, {
      env: {port: 1111},
    })
  },
  watch: ['src/**.js'],
}
```

To say hello: `task hello --name foo`

To build archive: `task tar`

To run server in watch mode: `task server -w`

## LICENSE

MIT Licensed
