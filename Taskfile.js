/* eslint-disable no-console */
export const build = {
  desc: 'Builds project',
  run: ctx => {
    ctx.sh.rm('-rf', 'dist')
    return ctx.shawn(`node_modules/.bin/tsc`)
  },
  watch: ['src/**/*.{js,ts}'],
}

export const server = {
  desc: 'Runs GraphQL Server',
  run: ctx => {
    return ctx.shawn(`node gqlserver/index.js`)
  },
  watch: ['schemas/**.gql', 'gqlserver/**.js'],
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

    const promises = tests.map(testfile => {
      const command = `task -f ${testfile} --silent test`
      return exec(command).then(
        res => {
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
    sh.exec(`tslint --fix -c ./tslint.json 'src/**/*.ts'`)
  },
}
