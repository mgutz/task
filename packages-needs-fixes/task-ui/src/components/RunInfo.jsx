import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Typography from 'material-ui/Typography'
import SaveBookmark from './SaveBookmark'
import {TopToolbar} from './styled'
import Box from './Box'

const SimpleArgs = ({data}) => {
  if (!data) return null

  const simple = ['string', 'number']
  const elements = []
  for (const k in data) {
    const typ = typeof k
    if (simple.indexOf(typ) > -1) {
      elements.push(
        <span key={elements.length}>
          <b>{k}</b>: {data[k]}
        </span>
      )
    } else {
      elements.push(
        <span key={elements.length}>
          <b>{k}</b>: ...
        </span>
      )
    }
  }
  return elements
}

class RunInfo extends Component {
  static propTypes = {
    record: PropTypes.object,
  }

  render() {
    if (!this.props.record) return null
    const {record} = this.props
    const {title} = record.ref

    return (
      <Box display="flex" as={TopToolbar}>
        <Box flex="1">
          <Typography variant="title">{title}</Typography>
          <Typography variant="subheading">
            <SimpleArgs data={record.args[2]} />
          </Typography>
        </Box>
        <SaveBookmark record={record} />
      </Box>
    )
  }
}

export default RunInfo
