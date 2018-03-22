import React from 'react'
import PropTypes from 'prop-types'

const setRule = (style, props, name, isContainer = false) => {
  if (props[name] !== undefined) {
    style[name] = props[name]
    if (isContainer) style.display = 'flex'
  }
}

const Box = (props) => {
  const {
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignContent,
    height,
    width,
    flex,
    display,
    margin,
    padding,
    style,
    ...rest
  } = props

  let boxStyle = {}

  if (flexDirection !== undefined) {
    boxStyle.flexDirection = flexDirection
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
  }
  if (alignContent !== undefined) {
    boxStyle.alignContent = alignContent
    boxStyle.display = 'flex'
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
  if (padding !== undefined) {
    boxStyle.padding = padding
  }

  if (style) {
    boxStyle = {...boxStyle, ...style}
  }

  return (
    <div style={boxStyle} {...rest}>
      {props.children}
    </div>
  )
}

Box.propTypes = {
  alignItems: PropTypes.string,
  alignContent: PropTypes.string,
  display: PropTypes.string,
  flex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  justifyContent: PropTypes.string,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default Box
