const assert = require('assert')

let top = ''
function a() {
  top += 'a'
}

module.exports = {
  test: {
    deps: [a],
    run: () => {
      assert.equal(top, 'a')
    },
  },
}
