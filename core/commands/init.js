const fp = require('path')

async function init(argv) {
  const taskfile = argv.typescript ? 'Taskfile.ts' : 'Taskfile.js'
  const taskrcPath = fp.join(process.cwd(), '.taskrc')
  const taskfilePath = fp.join(process.cwd(), taskfile)
  const content = argv['init-example']
    ? argv.typescript ? typescript : javascript
    : empty

  if (fs.existsSync(taskfilePath)) {
    exitError(`SKIPPED ${taskfilePath} exists`)
  }

  if (!fs.existsSync(taskrcPath)) {
    fs.writeFileSync(taskrcPath, taskrc, 'utf8')
    log.info('OK .taskrc created')
  }

  return fs
    .writeFile(taskfilePath, content, 'utf8')
    .then(exitOKFn(`${taskfilePath} created`), exitErrorFn())
}

const empty = ``

/* eslint-disable max-len */
const javascript = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`

const typescript = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`

const taskrc = `
module.exports = {
  // debug: true,
  // file: 'Taskfile.mjs'
}
`

module.exports = {init}
