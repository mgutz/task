import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {UnorderedList} from '#/components/styled'
import styled from 'styled-components'
import TaskHistory from './TaskHistory'

const Item = styled.li`
  padding: 10px;
`

const mapDispatch = ({tasks: {run, stop}}) => ({run, stop})

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
        <UnorderedList>
          <Item>{task.name} Actions &amp; History</Item>
          <Item>
            {' '}
            <a title="run" onClick={this.doRun}>
              run
            </a>{' '}
            <a title="stop" onClick={this.doStop}>
              stop
            </a>
          </Item>
        </UnorderedList>
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
