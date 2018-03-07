import {sleep} from '../core/util'
import * as assert from 'assert'

let top = ''
// parallel task need their own buffer since they complete as a unit
let p1 = ''
let p2 = ''
let p3 = ''

// parallels are tricky to test since they do not have a run
// method called after Promise.all() completes

export const a = async () => {
  await sleep(3)
  top += 'a'
}

export const b = {
  deps: [a],
  run: async () => {
    await sleep(1)
    p1 += 'b'
  },
}

export const c = () => {
  p1 += 'c'
}

export const d = async () => {
  await sleep(20)
  p2 += 'd'
  p1 += p2
}

export const e = () => {
  p2 += 'e'
}

export const f = async () => {
  await sleep(10)
  p3 += 'f'
  p2 += p3
}

export const g = () => {
  p3 += 'g'
}

export const test = {
  deps: {p: [b, c, {p: [d, e, {p: [f, g]}]}]},
  run: () => {
    top += p1
    assert.equal(top, 'acbegfd')
  },
}
