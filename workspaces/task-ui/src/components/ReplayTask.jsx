import {connect} from 'react-redux'
import {Replay as ReplayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import HistoryStatus from './HistoryStatus'

const mapDispatch = ({taskfiles: {replay}}) => ({
  replay,
})
@connect(null, mapDispatch)
export default class ReplayTask extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    replay: PropTypes.func.isRequired,
  }

  render() {
    const {history} = this.props

    if (history.status === 'closed') {
      return (
        <IconButton onClick={this.doReplay(history)}>
          <ReplayIcon />
        </IconButton>
      )
    }

    return <HistoryStatus history={history} />
  }

  doReplay = (history) => () => {
    this.props.replay(history)
  }
}
