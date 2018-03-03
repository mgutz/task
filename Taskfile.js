export async function test({globby, exec}) {
  const tests = await globby(['tests/test*.{js,ts}'])
  const promises = tests.map(testfile => {
    const command = `task -f ${testfile} --silent test`
    return exec(command).then(
      () => console.log(`OK ${testfile}`),
      err => {
        console.error(`FAIL ${testfile}`, err)
      }
    )
  })
  return Promise.all(promises)
}
