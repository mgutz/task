import React, {Component} from 'react'
import IconButton from 'material-ui/IconButton'
import {
  FiberManualRecord as Record,
  Replay as ReplayIcon,
  Stop as StopIcon,
} from 'material-ui-icons'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

const RecordIcon = styled(Record)`
  color: ${(props) => (props.status === 'running' ? 'green' : '')};
`
const mapDispatch = ({histories: {stop}}) => ({stop})

@connect(null, mapDispatch)
class RunStatus extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    stop: PropTypes.func.isRequired,
  }

  state = {hover: false}

  render() {
    const {record: {status}} = this.props
    const {hover} = this.state

    const icon = hover ? (
      <span>
        <IconButton title="stop">
          <StopIcon onClick={this.doStop} />
        </IconButton>
        <IconButton>
          <ReplayIcon onClick={this.doReplay} />
        </IconButton>
      </span>
    ) : (
      <span>
        <IconButton>
          <RecordIcon status={status} />
        </IconButton>
      </span>
    )

    if (status !== 'running') return null
    return (
      <div onMouseOver={this.doMouseOver} onMouseLeave={this.doMouseLeave}>
        {icon}
      </div>
    )
  }

  doMouseOver = () => {
    this.setState({hover: true})
  }

  doMouseLeave = () => {
    this.setState({hover: false})
  }

  doReplay = () => {
    console.error('doReplay not yet implemented')
  }

  doStop = () => {
    const {stop, record: {pid}} = this.props
    stop({pid})
  }
}

export default RunStatus
