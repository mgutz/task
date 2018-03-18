import {connect} from 'react-redux'
import {Replay as ReplayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import HistoryStatus from './HistoryStatus'
import {uid} from '#/util'

const mapDispatch = ({
  project: {setBookmarkActiveHistory},
  taskfiles: {run, setActiveHistory},
  router: {navigate},
}) => ({
  navigate,
  run,
  setBookmarkActiveHistory,
  setActiveHistory,
})

@connect(null, mapDispatch)
class ReplayTask extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    run: PropTypes.func.isRequired,
    setActiveHistory: PropTypes.func.isRequired,
    setBookmarkActiveHistory: PropTypes.func.isRequired,
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
    const {
      navigate,
      run,
      setActiveHistory,
      setBookmarkActiveHistory,
    } = this.props
    // id for tracking the new history item
    const newHistoryId = uid()
    const {args, refId, refKind, route: oldRoute} = history

    // update route to use new history
    const route = {
      ...oldRoute,
      params: {...oldRoute.params, historyId: newHistoryId},
    }

    run({newHistoryId, args, refId, refKind, route})

    if (refKind === 'task') {
      // set new history as active
      setActiveHistory({id: refId, historyId: newHistoryId})
    } else if (refKind === 'bookmark') {
      setBookmarkActiveHistory({id: refId, historyId: newHistoryId})
    }
    navigate(route)
  }
}

export default ReplayTask
