import * as React from 'react'
import {connect} from 'react-redux'
import TaskActionBar from '#/components/TaskActionBar'
import TaskLog from '#/components/TaskLog'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import {select} from '@rematch/select'
import Saved from './Saved'
import Taskfiles from './Taskfiles'

const {Fragment} = React

const mapState = (state) => {
  let task
  const route = state.router.route
  const {params} = route
  task = select.taskfiles.taskByIdThenName(
    state,
    params.taskfileId,
    params.taskName
  )
  return {
    project: state.project,
    route,
    task,
  }
}

const mapDispatch = ({project: {load}}) => ({loadProject: load})

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
          <Taskfiles taskfiles={project.taskfiles} />
          <Saved histories={project.histories} />
        </nav>
        {this.renderTaskDetail(task)}
      </Fragment>
    )
  }
}
