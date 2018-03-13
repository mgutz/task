const {injectBabelPlugin} = require('react-app-rewired')
const fp = require('path')
const rewireCSSNext = require('react-app-rewire-postcss-cssnext')

module.exports = function override(config, env) {
  // import pseudo-absolute paths relative to src
  config.resolve.alias['#'] = fp.join(__dirname, 'src')

  config = rewireCSSNext(config, env)

  // allow @decorators
  config = injectBabelPlugin('transform-decorators-legacy', config)
  return config
}
