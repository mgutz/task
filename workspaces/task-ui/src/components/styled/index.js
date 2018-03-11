import styled from 'styled-components'
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
