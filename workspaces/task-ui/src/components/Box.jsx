import React from 'react'
import PropTypes from 'prop-types'

// const setRule = (style, props, name, isContainer = false) => {
//   if (props[name] !== undefined) {
//     style[name] = props[name]
//     if (isContainer) style.display = 'flex'
//   }
// }

const Box = (props) => {
  const {
    alignContent,
    alignItems,
    as: El,
    background,
    center,
    children,
    color,
    column,
    display,
    flex,
    flexDirection,
    flexWrap,
    height,
    justifyContent,
    margin,
    overflow,
    overflowY,
    padding,
    row,
    shape,
    style,
    width,
    ...rest
  } = props

  let boxStyle = {}

  // NO NEED to be DRY here, these are simple rules and vscode makes it easy
  // to add/remove rules

  //// sets display="flex"

  if (flexDirection !== undefined) {
    boxStyle.flexDirection = flexDirection
    boxStyle.display = 'flex'
  } else if (column) {
    boxStyle.flexDirection = 'column'
    boxStyle.display = 'flex'
  } else if (row) {
    boxStyle.flexDirection = 'row'
    boxStyle.display = 'flex'
  }

  if (flexWrap !== undefined) {
    boxStyle.flexWrap = flexWrap
    boxStyle.display = 'flex'
  }
  if (justifyContent !== undefined) {
    boxStyle.justifyContent = justifyContent
    boxStyle.display = 'flex'
  }
  if (alignItems !== undefined) {
    boxStyle.alignItems = alignItems
    boxStyle.display = 'flex'
  } else if (center) {
    boxStyle.alignItems = 'center'
    boxStyle.display = 'flex'
  }

  if (alignContent !== undefined) {
    boxStyle.alignContent = alignContent
    boxStyle.display = 'flex'
  }

  //// applies to container and item

  if (background !== undefined) {
    boxStyle.background = background
  }
  if (color !== undefined) {
    boxStyle.color = color
  }
  if (display !== undefined) {
    boxStyle.display = display
  }
  if (height !== undefined) {
    boxStyle.height = height
  }
  if (width !== undefined) {
    boxStyle.width = width
  }
  if (flex !== undefined) {
    boxStyle.flex = flex
  }
  if (margin !== undefined) {
    boxStyle.margin = margin
  }
  if (overflow !== undefined) {
    boxStyle.overflow = overflow
  }
  if (overflowY !== undefined) {
    boxStyle.overflowY = overflowY
  }
  if (padding !== undefined) {
    boxStyle.padding = padding
  }
  if (shape === 'circle') {
    boxStyle.borderRadius = '50%'
  }
  if (shape === 'pill') {
    boxStyle.borderRadius = '999px'
  }
  if (shape === 'rounded') {
    boxStyle.borderRadius = '8px'
  }

  if (style) {
    boxStyle = {...boxStyle, ...style}
  }

  return (
    <El style={boxStyle} {...rest}>
      {children}
    </El>
  )
}

Box.propTypes = {
  alignContent: PropTypes.string,
  alignItems: PropTypes.string,
  as: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.func,
  ]),
  background: PropTypes.string,
  center: PropTypes.bool,
  children: PropTypes.node,
  color: PropTypes.string,
  column: PropTypes.bool,
  display: PropTypes.string,
  flex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  justifyContent: PropTypes.string,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  overflow: PropTypes.string,
  overflowY: PropTypes.string,

  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  row: PropTypes.bool,
  shape: PropTypes.oneOf(['circle', 'pill', 'rounded']),
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Box.defaultProps = {
  as: 'div',
}

export default Box
