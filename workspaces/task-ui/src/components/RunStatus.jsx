import React, {Component} from 'react'
import IconButton from 'material-ui/IconButton'
import {FiberManualRecord as Record, Stop as StopIcon} from 'material-ui-icons'
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
    history: PropTypes.object.isRequired,
    stop: PropTypes.func.isRequired,
  }

  state = {hover: false}

  render() {
    const {history: {status}} = this.props
    const {hover} = this.state

    const onClick = hover ? this.doStop : null
    const icon = hover ? <StopIcon /> : <RecordIcon status={status} />

    if (status !== 'running') return null
    return (
      <IconButton
        onClick={onClick}
        onMouseOver={this.doMouseOver}
        onMouseLeave={this.doMouseLeave}
      >
        {icon}
      </IconButton>
    )
  }

  doMouseOver = () => {
    this.setState({hover: true})
  }

  doMouseLeave = () => {
    this.setState({hover: false})
  }

  doStop = () => {
    const {stop, history: {pid}} = this.props
    stop({pid})
  }
}

export default RunStatus
