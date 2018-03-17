import React, {Fragment, Component} from 'react'
import PropTypes from 'prop-types'
import Collapse from 'material-ui/transitions/Collapse'
import List, {ListItem, ListItemIcon, ListItemText} from 'material-ui/List'
import {withState} from 'recompose'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
import {connect} from 'react-redux'
import classNames from 'classnames'
import TocIcon from 'material-ui-icons/Toc'
import styled from 'styled-components'
import RunTask from './RunTask'

const InsetList = styled(List)`
  margin-left: 10px;
`
const mapState = (state, props) => {
  return {
    tasks: state.taskfiles[props.taskfile.id],
    route: state.router.route,
  }
}
const mapDispatch = ({taskfiles: {fetchTasks}, router: {navigate}}) => ({
  fetchTasks,
  navigate,
})

@withState('collapsed', 'setCollapsed', true)
@connect(mapState, mapDispatch)
class Taskfile extends Component {
  componentDidMount() {
    this.props.fetchTasks({taskfileId: this.props.taskfile.id})
  }

  renderTasks(tasks) {
    const {route} = this.props
    return tasks.map((task) => {
      const classes = classNames({
        'is-selected':
          route.params.taskName === task.name &&
          route.params.taskfileId === task.taskfileId,
      })

      return (
        <ListItem
          className={classes}
          key={task.name}
          onClick={this.doSetActive(task)}
        >
          <ListItemText primary={task.name} secondary={task.desc} />
          <ListItemIcon>
            <RunTask task={task} />
          </ListItemIcon>
        </ListItem>
      )
    })
  }

  render() {
    const {collapsed, setCollapsed, taskfile, tasks} = this.props
    return (
      <Fragment>
        <ListItem onClick={() => setCollapsed(!collapsed)}>
          <ListItemIcon>
            <TocIcon />
          </ListItemIcon>
          <ListItemText primary={taskfile.id} />
          {collapsed ? <ExpandMore /> : <ExpandLess />}
        </ListItem>
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <InsetList>
            {tasks ? this.renderTasks(tasks) : 'Loading...'}
          </InsetList>
        </Collapse>
      </Fragment>
    )
  }

  doSetActive = (task) => () => {
    const {navigate, taskfile} = this.props
    navigate({
      name: 'tasks.name',
      params: {
        taskName: task.name,
        taskfileId: taskfile.id,
      },
    })
  }
}

Taskfile.propTypes = {
  collapsed: PropTypes.bool,
  fetchTasks: PropTypes.func,
  navigate: PropTypes.func,
  route: PropTypes.object,
  setCollapsed: PropTypes.func,
  tasks: PropTypes.array,
  taskfile: PropTypes.object.isRequired,
}

export default Taskfile
