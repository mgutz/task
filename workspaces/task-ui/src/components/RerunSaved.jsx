import {connect} from 'react-redux'
import {PlayCircleFilled as PlayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import HistoryStatus from './HistoryStatus'

const mapDispatch = ({taskfiles: {rerun}}) => ({rerun})
@connect(null, mapDispatch)
class RerunSaved extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    rerun: PropTypes.func.isRequired,
  }

  render() {
    const {history} = this.props

    if (history.status === 'closed') {
      return (
        <IconButton onClick={this.doReplay(history)}>
          <PlayIcon />
        </IconButton>
      )
    }

    return <HistoryStatus history={history} />
  }

  doReplay = (history) => () => {
    console.log('history', history)
    this.props.rerun(history)
  }
}

export default RerunSaved
