import * as React from 'react'
import {connect} from 'react-redux'
import {routeNode} from 'react-router5'
import TaskfileItem from '#/components/Taskfile'
// import TaskActionBar from '#/components/TaskActionBar'
// import TaskLog from '#/components/TaskLog'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItem} from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'

const {Fragment} = React

// const mapState = (state, props) => {
//   const routeName = _.get(props, 'route.name')
//   const task =
//     routeName === 'tasks.name'
//       ? _.find(state.tasks, {name: props.route.params.name})
//       : null
//   return {
//     task,
//     tasks: state.tasks,
//   }
// }

const mapState = (state) => ({project: state.project})
const mapDispatch = ({project: {load}}) => ({loadProject: load})

@routeNode('tasks')
@connect(mapState, mapDispatch)
export default class ProjectView extends React.Component {
  static propTypes = {
    loadProject: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired,
    route: PropTypes.object,
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

  render() {
    const {project} = this.props
    if (!project.taskfiles) return null

    return (
      <Fragment>
        <nav>
          <List>
            <ListSubheader>Project</ListSubheader>
            {this.renderTaskfiles(project.taskfiles)}
          </List>
        </nav>
      </Fragment>
    )
  }
}
