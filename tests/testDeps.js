// task -f testDeps.js test

const {sleep} = require('../util')

let memo = ''
export function a() {
  memo += 'a'
}

export function b() {
  memo += 'b'
}

export async function c() {
  await sleep(10)
  memo += 'c'
}

export default {
  b: {
    desc: 'b task',
  },
  d: async () => {
    memo += 'd'
  },
  x: ['y'],
  y: () => (memo += 'y'),
  test: {
    deps: [b, a, {p: [c, 'd']}],
    run: () => {
      console.assert(memo === 'badc')
    },
  },
}
