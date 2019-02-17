import React from 'react'
import MuiTextField from 'material-ui/TextField'
import {getDisplayName} from 'recompose'
import PropTypes from 'prop-types'

const createElement = (Element) => {
  // eslint-disable-next-line
  const el = ({field, form, ...rest}) => {
    const isError = form.dirty && form.errors[field.name]
    return <Element {...field} {...rest} error={Boolean(isError)} />
  }
  el.displayName = 'formik(' + getDisplayName(Element) + ')'
  el.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
  }
  return el
}

export const TextField = createElement(MuiTextField)
