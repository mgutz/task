import * as assert from 'assert'
import {sleep} from './sleep'

let memo = ''
export function a() {
  memo += 'a'
}

export async function b() {
  await sleep(3)
  memo += 'b'
}

export async function c() {
  await sleep(6)
  memo += sum(10, 20)
}

function sum(a, b) {
  return a + b
}

export function d() {
  memo += 'd'
}

export const y = () => (memo += 'y')

export const x = {deps: [y]}

export const lazy_ = (ctx) => {
  const msg = 'z'
  return {
    run: () => {
      memo += msg
    },
  }
}

export const test = {
  deps: [b, a, {p: [c, d]}, lazy_],
  run: () => {
    assert.equal(memo, 'bad30z')
  },
}
