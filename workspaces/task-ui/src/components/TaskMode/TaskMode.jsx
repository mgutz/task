import * as React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import OutputPanel from './OutputPanel'
import TaskPanel from './TaskPanel'
import {select} from '@rematch/select'
import {dispatch} from '@rematch/core'
import Box from '../Box'

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

const mapDispatch = (dispatch) => {
  const {project: {loadProject}, router: {navigateToDefault}} = dispatch
  return {loadProject, navigateToDefault}
}

@connect(mapState, mapDispatch)
class TaskMode extends React.Component {
  static propTypes = {
    invalidRoute: PropTypes.bool,
    loadProject: PropTypes.func.isRequired,
    navigateToDefault: PropTypes.func.isRequired,
    project: PropTypes.object,
    route: PropTypes.object.isRequired,
  }

  componentDidMount() {
    if (!this.props.project.taskfiles) {
      this.props.loadProject()
    }

    // Task ids are temporary since they are created on the fly, on a refresh
    // the id no longer exist in application state so go to default route
    const {invalidRoute, navigateToDefault} = this.props
    if (invalidRoute) {
      navigateToDefault()
      dispatch({type: 'reset'})
      return
    }
  }

  render() {
    const {project} = this.props
    if (!project.taskfiles) return null

    return (
      <Fragment>
        <aside>
          <TaskPanel project={project} />
        </aside>
        <Box height="100%">
          <OutputPanel />
        </Box>
      </Fragment>
    )
  }
}

export default TaskMode
