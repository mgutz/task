import _ from 'lodash'

export class TestTracker {
  constructor() {
    this.tests = {}
    this.order = 0
  }

  track(name) {
    this.tests[name] = {name, order: this.order}
    this.order++
  }

  validateOrder(orderArr) {
    let index = 0
    for (const name of orderArr) {
      const item = this.tests[name]
      if (!item) {
        console.error(`Test not found: ${name}`)
        return false
      }
      if (item.order !== index) {
        console.error(`order=${order} <> index=${index}`)
        return false
      }
      index++
    }

    return true
  }
}
