import * as React from 'react'
import {connect} from 'react-redux'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import RunPanel from './RunPanel'
import OutputPanel from './OutputPanel'
import TaskPanel from './TaskPanel'

const {Fragment} = React

const mapState = (state) => ({project: state.project})

const mapDispatch = ({project: {loadProject}}) => ({loadProject})

@connect(mapState, mapDispatch)
class ProjectView extends React.Component {
  static propTypes = {
    loadProject: PropTypes.func,
    project: PropTypes.object,
    route: PropTypes.object,
  }

  componentDidMount() {
    if (!this.props.project.taskfiles) this.props.loadProject()
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
