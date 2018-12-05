/*
  "off" or 0 - turn the rule off
  "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
  "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
*/

module.exports = {
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  rules: {
    // would prefer 'as-needed' but reformatting a long line that exceds max-len doesn't work
    'arrow-body-style': ['error', 'always'],

    // would prefer 'multi' but reformatting a long line that exceds max-len doesn't work
    curly: ['error', 'all'],

    'max-len': [
      'error',
      {
        code: 80,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreUrls: true,
        tabWidth: 2,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  plugins: [],
  extends: ['eslint:recommended'],
}
