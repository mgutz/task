import * as React from 'react'
import {connect} from 'react-redux'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import RunPanel from './RunPanel'
import OutputPanel from './OutputPanel'
import TaskPanel from './TaskPanel'
import {select} from '@rematch/select'

const {Fragment} = React

const mapState = (state) => {
  const {route} = state.router
  let invalidRoute = false
  if (route.name.startsWith('tasks') && route.params && route.params.id) {
    const task = select.taskfiles.taskById(state, route.params.id)
    if (!task) {
      invalidRoute = true
    }
  }

  return {
    project: state.project,
    invalidRoute,
    route: state.router.route,
  }
}

const mapDispatch = ({
  project: {loadProject},
  router: {navigateToDefault},
}) => ({loadProject, navigateToDefault})

@connect(mapState, mapDispatch)
class ProjectView extends React.Component {
  static propTypes = {
    invalidRoute: PropTypes.bool,
    loadProject: PropTypes.func.isRequired,
    navigateToDefault: PropTypes.func.isRequired,
    project: PropTypes.object,
    route: PropTypes.object.isRequired,
  }

  componentDidMount() {
    if (!this.props.project.taskfiles) this.props.loadProject()

    // Task ids are temporary since they are created on the fly, on a refresh
    // the id no longer exist in application state so go to default route
    const {invalidRoute, navigateToDefault} = this.props
    if (invalidRoute) {
      navigateToDefault()
      return
    }
  }

  render() {
    const {project} = this.props
    if (!project.taskfiles) return null

    return (
      <Fragment>
        <nav>
          <TaskPanel project={project} />
        </nav>
        <aside>
          <RunPanel />
        </aside>
        <div>
          <OutputPanel />
        </div>
      </Fragment>
    )
  }
}

export default ProjectView
