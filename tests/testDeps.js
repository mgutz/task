// task -f testDeps.js test

const {sleep} = require('../util')

let memo = ''
export async function a() {
  await sleep(10)
  memo += 'a'
}

export function b() {
  memo += 'b'
}

export async function c() {
  await sleep(3)
  memo += 'c'
}

export async function e() {
  await sleep(2)
  memo += 'e'
}

export async function f() {
  memo += 'f'
}

export default {
  b: {
    desc: 'b task',
  },
  d: async () => {
    memo += 'd'
  },
  g: {p: [e, f]},
  x: ['y'],
  y: () => (memo += 'y'),
  test: {
    deps: [b, a, {p: [c, 'd']}, ' g'],
    run: () => {
      //console.log('MEMO', memo)
      console.assert(memo === 'badcfe')
    },
  },
}
