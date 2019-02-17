import React from 'react'
import ReactJSONTree from 'react-json-tree'
import styled from 'styled-components'
import PropTypes from 'prop-types'

// see https://github.com/chriskempson/base16/blob/master/styling.md
//
const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
}

const JSONTree = styled(ReactJSONTree).attrs({
  theme,
})`
  font-family: monospace important!;
  font-size: 10px;
`

const JSONView = (props) => <JSONTree {...props} />

JSONView.propTypes = {
  data: PropTypes.object.isRequired,
}

export default JSONView
