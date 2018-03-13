import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TaskHistory from './TaskHistory'
import {IconButton} from '#/components/material'
import StopIcon from 'material-ui-icons/Stop'
import PlayArrowIcon from 'material-ui-icons/PlayArrow'

const mapDispatch = ({taskfiles: {run, stop}}) => ({run, stop})

@connect(null, mapDispatch)
export default class TaskActionBar extends React.PureComponent {
  static propTypes = {
    run: PropTypes.func,
    stop: PropTypes.func,
    task: PropTypes.object.isRequired,
  }

  render() {
    const {task} = this.props
    return (
      <div>
        <IconButton onClick={this.doStop}>
          <StopIcon />
        </IconButton>
        <IconButton onClick={this.doRun}>
          <PlayArrowIcon />
        </IconButton>
        <TaskHistory task={task} />
      </div>
    )
  }

  doRun = () => {
    const {run, task} = this.props

    // TODO need form
    if (task.name === 'hello') {
      return run([task.taskfileId, task.name, {name: 'world'}])
    }
    run([task.name])
  }

  doStop = () => {
    const {stop, task} = this.props
    stop([task.taskfileId, task.name])
  }
}
