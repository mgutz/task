import * as _ from 'lodash'
import * as React from 'react'
import {connect} from 'react-redux'
import {routeNode} from 'react-router5'
import TaskActionBar from '#/components/TaskActionBar'
import TaskLog from '#/components/TaskLog'
import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
import {konsole} from '#/util'

const {Fragment} = React

const mapState = (state, props) => {
  const routeName = _.get(props, 'route.name')
  const task =
    routeName === 'tasks.name'
      ? _.find(state.tasks, {name: props.route.params.name})
      : null
  return {
    task,
    tasks: state.tasks,
  }
}
const mapDispatch = ({tasks: {all}}) => ({all})

@routeNode('tasks')
@connect(mapState, mapDispatch)
export default class TaskView extends React.Component {
  static propTypes = {
    all: PropTypes.func.isRequired,
    route: PropTypes.object,
    task: PropTypes.object,
    tasks: PropTypes.array.isRequired,
  }

  componentWillMount() {
    this.props.all().catch(konsole.error)
  }

  render() {
    const {task, tasks} = this.props

    return (
      <Fragment>
        <nav>
          <TasksNav tasks={tasks} />
        </nav>
        {task && (
          <Fragment>
            <aside>
              <TaskActionBar task={task} />
            </aside>
            <main>
              <TaskLog task={task} />
            </main>
          </Fragment>
        )}
      </Fragment>
    )
  }
}
