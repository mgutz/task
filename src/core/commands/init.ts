import * as fs from 'fs'
import * as fp from 'path'
import {promisify} from 'util'
import * as exits from '../exits'
import log from '../log'

const writeFile = promisify(fs.writeFile)

export async function run(ctx: AppContext) {
  const argv = ctx.options
  const taskfile = argv.typescript ? 'Taskfile.ts' : 'Taskfile.js'
  const taskrcPath = fp.join(process.cwd(), '.taskrc')
  const taskfilePath = fp.join(process.cwd(), taskfile)
  const content = argv.initExample
    ? argv.typescript ? typescript : javascript
    : empty

  if (fs.existsSync(taskfilePath)) {
    exits.error(`SKIPPED ${taskfilePath} exists`)
  }

  if (!fs.existsSync(taskrcPath)) {
    fs.writeFileSync(taskrcPath, taskrc, 'utf8')
    log.info('OK .taskrc created')
  }

  return writeFile(taskfilePath, content).then(
    exits.okFn(`${taskfilePath} created`),
    exits.errorFn()
  )
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
