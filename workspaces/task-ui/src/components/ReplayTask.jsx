import {connect} from 'react-redux'
import {Replay as ReplayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import RunStatus from './RunStatus'

const mapDispatch = ({taskfiles: {run}, router: {navigate}}) => ({
  navigate,
  run,
})

@connect(null, mapDispatch)
class ReplayTask extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    run: PropTypes.func.isRequired,
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

    return <RunStatus history={history} />
  }

  doReplay = (history) => () => {
    const {run} = this.props
    run(history)
  }
}

export default ReplayTask
