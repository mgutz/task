export async function test({globby, exec}) {
  const tests = await globby(['tests/{pass,fail}*.{js,ts}'])
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
}
