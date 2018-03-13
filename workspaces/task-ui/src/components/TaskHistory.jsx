import * as _ from 'lodash'
import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubHeader,
} from '#/components/material'
import {FiberManualRecord} from 'material-ui-icons'
import * as strftime from 'strftime'

import styled from 'styled-components'

const Status = styled(FiberManualRecord)`
  color: ${(props) => (props.status === 'running' ? 'green' : '')};
`

const mapState = (state, props) => {
  const taskName = _.get(props, 'task.name')
  return {
    histories: state.history[taskName],
  }
}

const mapDispatch = ({tasks: {setActivePID}}) => ({setActivePID})

@connect(mapState, mapDispatch)
export default class TaskHistory extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    setActivePID: PropTypes.func,
    task: PropTypes.object,
  }

  renderItems = (histories) => {
    return histories.map((history) => {
      const status =
        `pid: ${history.pid} ` +
        (history.status === 'running'
          ? ''
          : 'for: ' + (history.statusedAt - history.createdAt) + 'ms')

      const olderThanOneDay =
        Date.now() - history.createdAt > 24 * 60 * 60 * 1000
      const dayFormat = '%F %I:%M:%S %p'
      const hourFormat = '%I:%M:%S %p'
      const format = olderThanOneDay ? dayFormat : hourFormat
      const caption = strftime(format, new Date(history.createdAt))

      return (
        <ListItem key={history.pid} divider>
          <ListItemText primary={caption} secondary={status} />
          <ListItemSecondaryAction>
            {' '}
            <Status
              value="fiber_manual_record"
              status={history.status}
              onClick={this.doSetActive(history)}
            />
          </ListItemSecondaryAction>
        </ListItem>
      )
    })
  }

  render() {
    const {histories} = this.props
    const caption = histories && histories.length > 0 ? 'History' : 'No History'

    return (
      <List>
        <ListSubHeader>{caption}</ListSubHeader>
        {histories && this.renderItems(histories)}
      </List>
    )
  }

  doSetActive = ({pid, taskName}) => () => {
    this.props.setActivePID({pid, taskName})
  }
}
