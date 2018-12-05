import * as assert from 'assert'
import {sleep} from './sleep'
import {TestTracker} from './util'

const tracker = new TestTracker()

export function a() {
  tracker.track('a')
}

export async function b() {
  await sleep(3)
  tracker.track('b')
}

export async function c() {
  await sleep(6)
  tracker.track(sum(10, 20))
}

function sum(a, b) {
  return a + b
}

export function d() {
  tracker.track('d')
}

export const y = () => {
  tracker.track('y')
}

export const x = {deps: [y]}

export const lazy_ = (_ctx) => {
  return {
    run: () => {
      tracker.track('z')
    },
  }
}

export const test = {
  deps: [b, a, {p: [c, d]}, x, lazy_],
  run: () => {
    assert.ok(tracker.validateOrder(['_before', 'b', 'a', 'd', '30', 'y', 'z']))
  },
}

// this should reun before any test in this file (only once)
export const _before = {
  run: () => {
    tracker.track('_before')
  },
}
