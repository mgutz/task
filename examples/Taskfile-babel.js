export function bah({event}) {
  console.log(`File changed: ${JSON.stringify(event)}`)
}

export default {
  bah: {
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
