import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TaskHistory from './TaskHistory'
import {IconButton} from '#/components/material'

const mapDispatch = ({tasks: {run, stop}}) => ({run, stop})

@connect(null, mapDispatch)
export default class TaskActionBar extends React.PureComponent {
  static propTypes = {
    run: PropTypes.func,
    stop: PropTypes.func,
    task: PropTypes.object.isRequired,
  }

  constructor() {
    super()
    this.actions = [
      {icon: 'play_arrow', onClick: this.doRun},
      {icon: 'stop', onClick: this.doStop},
    ]
  }

  render() {
    const {task} = this.props
    return (
      <div>
        <IconButton icon="stop" onClikc={this.doStop} />
        <IconButton icon="play_arrow" onClick={this.doRun} accent />
        <TaskHistory task={task} />
      </div>
    )
  }

  doRun = () => {
    const {run, task} = this.props

    // TODO need form
    if (task.name === 'hello') {
      return run([task.name, {name: 'world'}])
    }
    run([task.name])
  }

  doStop = () => {
    const {stop, task} = this.props
    stop([task.name])
  }
}
