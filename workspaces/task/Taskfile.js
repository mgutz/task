/* eslint-disable no-console */

export const clean = {
  run: ({sh}) => {
    sh.rm('-rf', 'dist')
  },
  once: true,
}

export const build = {
  deps: [clean],
  desc: 'Builds project',
  run: (ctx) => {
    return ctx.shawn(`node_modules/.bin/tsc`)
  },
  watch: ['src/**/*.{js,ts}'],
}

export const server = {
  deps: [build],
  desc: 'Runs GraphQL Server',
  run: ({shawn}) => {
    return shawn(`node index.js --gui`)
  },
  watch: ['schemas/*.gql', 'src/**/*.ts'],
}

export const test = {
  desc: 'Runs tests',
  run: async ({globby, exec, argv}) => {
    const which = argv._[0]
    const pattern =
      which === 'all'
        ? 'tests/{pass,fail}*.{js,ts}'
        : which === 'fail' ? 'tests/fail*.{js,ts}' : 'tests/pass*.{js,ts}'
    const tests = await globby([pattern])

    const promises = tests.map((testfile) => {
      const command = `task -f ${testfile} --silent test`
      return exec(command).then(
        (res) => {
          const {code, stderr} = res
          if (code !== 0 || (testfile.indexOf('fail') > -1 && !stderr)) {
            return console.error(`FAIL ${testfile}`)
          }
          console.log(`PASS ${testfile}`)
        },
        ({code}) => {
          if (code === 0 || testfile.indexOf('pass') > -1) {
            return console.error(`FAIL ${testfile}`)
          }
          console.error(`PASS ${testfile}`)
        }
      )
    })
    return Promise.all(promises)
  },
}

export const lint = {
  desc: 'Lints the project',
  deps: [build],
  run: ({sh}) => {
    sh.exec(
      `tslint --project tsconfig.json --fix -c ./tslint.json 'src/**/*.ts'`
    )
  },
}

export const hello = {
  run: ({argv}) => {
    console.log(`Hello ${argv.name}`)
    return `Hello ${argv.name}`
  },
}

// TODO set `_` with task name, clear gui flag
export const ipc = {
  run: ({shawn}) => {
    return shawn(`
    export task_ipc_options='{"_":["hello"],"?":false,"help":false,"babel":true,"debug":false,"verbose":false,"dotenv":true,"dry-run":false,"dryRun":false,"gui":false,"init":false,"init-example":false,"initExample":false,"list":false,"silent":false,"trace":false,"ts":false,"typescript":false,"w":false,"watch":false,"babelExtensions":[".js",".jsx",".es6",".es",".mjs",".ts",".tsx"],"babel-extensions":[".js",".jsx",".es6",".es",".mjs",".ts",".tsx"],"file":"","f":"","name":"foo"}'
    task
    `)
  },
}