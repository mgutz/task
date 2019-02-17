import styled from 'styled-components'
import MuiToolbar from 'material-ui/Toolbar'
export * from './List'

// Convenience wrapper around styled to start with a tag and class name.
// If `el` is the only argument, it is considered a class(es) for a div.
export const classed = (el, classes) => {
  if (!classes) {
    return styled.div.attrs({className: el})``
  }

  if (!el) el = 'div'
  return styled(el).attrs({className: classes})``
}

export const TopToolbar = styled(MuiToolbar)`
  border-bottom: solid 1px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`
