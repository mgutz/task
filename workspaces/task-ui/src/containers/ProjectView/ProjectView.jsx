import * as React from 'react'
import {connect} from 'react-redux'
import {routeNode} from 'react-router5'
import TaskfileItem from '#/components/Taskfile'
import TaskActionBar from '#/components/TaskActionBar'
import TaskLog from '#/components/TaskLog'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'

import {select} from '@rematch/select'

const {Fragment} = React

const mapState = (state, props) => {
  const {route} = props
  let task
  if (route) {
    const {params} = route
    task = select.taskfiles.taskByIdThenName(
      state,
      params.taskfileId,
      params.taskName
    )
  }
  return {
    project: state.project,
    task,
  }
}

const mapDispatch = ({project: {load}}) => ({loadProject: load})

@routeNode('tasks')
@connect(mapState, mapDispatch)
export default class ProjectView extends React.Component {
  static propTypes = {
    loadProject: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired,
    route: PropTypes.object,
    task: PropTypes.object,
  }

  componentDidMount() {
    if (!this.props.project.taskfiles) this.props.loadProject()
  }

  /*
  <Fragment>
  <nav>
    <Taskfiles project={project} />
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
*/

  renderTaskfiles(taskfiles) {
    return taskfiles.map((taskfile) => {
      return <TaskfileItem key={taskfile.id} taskfile={taskfile} />
    })
  }

  renderTaskDetail(task) {
    if (!task) return null
    return (
      <Fragment>
        <aside>
          <TaskActionBar task={task} />
        </aside>
        <main>
          <TaskLog task={task} />
        </main>
      </Fragment>
    )
  }

  render() {
    const {project, task} = this.props
    if (!project.taskfiles) return null

    return (
      <Fragment>
        <nav>
          <List>
            <ListSubheader>Project</ListSubheader>
            {this.renderTaskfiles(project.taskfiles)}
          </List>
        </nav>
        {this.renderTaskDetail(task)}
      </Fragment>
    )
  }
}
