// task -f testDeps.js test

import {sleep} from '../util'

let memo = ''
export function a() {
  memo += 'a'
}

export function b() {
  memo += 'b'
}

export async function c() {
  await sleep(10)
  memo += sum(10, 20)
}

function sum(a: number, b: number): number {
  return a + b
}

export default {
  d: async () => {
    memo += 'd'
  },
  x: {deps: ['y']},
  y: () => (memo += 'y'),
  test: {
    deps: [b, a, {p: [c, 'd']}],
    run: () => {
      console.assert(memo === 'bad30')
    },
  },
}
