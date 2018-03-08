import {sleep} from './sleep'
import * as assert from 'assert'

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

function sum(a: number, b: number): number {
  return a + b
}

export function d() {
  memo += 'd'
}

export const y = () => (memo += 'y')

export const x = {deps: [y]}

export const test = {
  deps: [b, a, {p: [c, d]}],
  run: () => {
    assert.equal(memo, 'bad30')
  },
}
