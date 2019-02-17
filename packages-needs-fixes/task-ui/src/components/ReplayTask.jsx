import {connect} from 'react-redux'
import {Replay as ReplayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import RunStatus from './RunStatus'
import {stopPropagation} from '#/util'

const mapDispatch = ({histories: {replay}, router: {navigate}}) => ({
  navigate,
  replay,
})

@connect(null, mapDispatch)
class ReplayTask extends React.Component {
  static propTypes = {
    navigate: PropTypes.func.isRequired,
    record: PropTypes.object.isRequired,
    replay: PropTypes.func.isRequired,
  }

  render() {
    const {record} = this.props

    if (record.status === 'closed') {
      return (
        <IconButton onClick={this.doReplay(record)}>
          <ReplayIcon />
        </IconButton>
      )
    }

    return <RunStatus record={record} />
  }

  doReplay = (record) => (e) => {
    stopPropagation(e)
    const {replay} = this.props
    replay({record})
  }
}

export default ReplayTask
