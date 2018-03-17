import * as _ from 'lodash'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import styled from 'styled-components'
import IconButton from 'material-ui/IconButton'
import {
  FiberManualRecord as Record,
  PlayArrow as PlayIcon,
  //Replay as ReplayIcon,
  Stop as StopIcon,
} from 'material-ui-icons'

const RecordIcon = styled(Record)`
  color: ${(props) => (props.status === 'running' ? 'green' : '')};
`

const ToolbarView = styled(Toolbar)`
  border-bottom: solid 1px #eee;
  margin-bottom: 10px;
`

const Flexography = styled(Typography)`
  flex: 1;
`

const HistoryStatus = ({history: {status}}) => {
  if (status !== 'running') return null
  return (
    <IconButton>
      <RecordIcon status={status} />
    </IconButton>
  )
}

HistoryStatus.propTypes = {
  history: PropTypes.object,
}

class HistoryActions extends Component {
  render() {
    if (!this.props.history) return null

    const {history} = this.props

    const title = `${_.upperFirst(history.taskName)}`
    const args = JSON.stringify(history.args[2])

    return (
      <ToolbarView>
        <HistoryStatus history={history} />
        <Typography variant="title">{title}</Typography>
        <Flexography>{args}</Flexography>
        <IconButton>
          <StopIcon />
        </IconButton>
        <IconButton>
          <PlayIcon />
        </IconButton>
      </ToolbarView>
    )
  }
}

HistoryActions.propTypes = {
  history: PropTypes.object,
}

export default HistoryActions
