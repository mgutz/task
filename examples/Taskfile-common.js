function bah({event}) {
  console.log(`File changed: ${JSON.stringify(event)}`)
}

module.exports = {
  bah: {
    run: bah,
    deps: ['bar', 'foo'],
    watch: ['./*.txt'],
  },
  bar: {
    deps: [() => console.log('bar')],
  },
  foo: () => {
    console.log('foo')
  },
}
