import * as React from 'react'
import {connect} from 'react-redux'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import HistoryArea from './HistoryArea'
import OutputArea from './OutputArea'
import TaskArea from './TaskArea'

const {Fragment} = React

const mapState = (state) => ({project: state.project})

const mapDispatch = ({project: {load}}) => ({loadProject: load})

@connect(mapState, mapDispatch)
class ProjectView extends React.Component {
  componentDidMount() {
    if (!this.props.project.taskfiles) this.props.loadProject()
  }

  render() {
    const {project} = this.props
    if (!project.taskfiles) return null

    return (
      <Fragment>
        <nav>
          <TaskArea project={project} />
        </nav>
        <aside>
          <HistoryArea />
        </aside>
        <div>
          <OutputArea />
        </div>
      </Fragment>
    )
  }
}

ProjectView.propTypes = {
  loadProject: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  route: PropTypes.object,
}

export default ProjectView
