import {connect} from 'react-redux'
import {Replay as ReplayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import HistoryStatus from './HistoryStatus'
import {uid} from '#/util'

const mapDispatch = ({taskfiles: {run, setActiveHistory}}) => ({
  run,
  setActiveHistory,
})

@connect(null, mapDispatch)
class ReplayTask extends React.Component {
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
    const {setLocation, run, setActiveHistory} = this.props
    // id for tracking the new history item
    const newHistoryId = uid()
    const {args, refId, refKind} = history
    run({newHistoryId, args, refId, refKind})

    // set new history as active
    setActiveHistory({id: refId, historyId: newHistoryId})

    setLocation(newHistoryId)
  }
}

ReplayTask.propTypes = {
  history: PropTypes.object.isRequired,
  run: PropTypes.func.isRequired,
  setActiveHistory: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
}

export default ReplayTask
