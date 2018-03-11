const {injectBabelPlugin} = require('react-app-rewired')
const fp = require('path')

module.exports = function override(config, env) {
  // import pseudo-absolute paths relative to src
  config.resolve.alias['#'] = fp.join(__dirname, 'src')

  // allow @decorators
  config = injectBabelPlugin('transform-decorators-legacy', config)
  return config
}
