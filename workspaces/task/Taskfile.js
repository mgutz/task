/* eslint-disable no-console */

export const clean = {
  run: ({sh}) => {
    sh.rm('-rf', 'dist')
  },
  once: true,
  ui: {
    hide: true,
  },
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
    return shawn(`node index.js --server`)
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
      const command = `task -f ${testfile} --trace test`
      return exec(command).then(
        (res) => {
          const {code, stderr} = res
          if (code !== 0 || (testfile.indexOf('fail') > -1 && !stderr)) {
            return console.error(`FAIL ${testfile}`)
          }
          console.log(`PASS ${testfile}`)
        },
        ({code}) => {
          const isPositiveTest = testfile.indexOf('pass') > -1
          if (isPositiveTest) {
            return console.error(`FAIL2 ${testfile} w/ code ${code}`)
          }
          console.error(`PASS2 ${testfile}`)
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
    sh.exec(`tslint --project tsconfig.json --fix -c ./tslint.json 'src/**/*.ts'`)
  },
}

export const hello = {
  run: ({argv}) => {
    console.log(`Hello ${argv.name}`)
    return `Hello ${argv.name}`
  },
  form: {
    name: String,
  },
}

// TODO set `_` with task name, clear server flag
export const ipc = {
  run: ({shawn}) => {
    return shawn(`
    export task_ipc_options='{"_":["hello"]}'
    task
    `)
  },
}

export const test1000 = () => {
  for (let i = 0; i < 1000; i++) {
    if (i % 10 === 0) {
      console.error('ERR', i)
      continue
    }
    console.log('OUT', i)
  }
}
