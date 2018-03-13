import React, {Fragment, Component} from 'react'
import PropTypes from 'prop-types'
import Collapse from 'material-ui/transitions/Collapse'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItem, ListItemIcon, ListItemText} from 'material-ui/List'
import {withState} from 'recompose'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
import {connect} from 'react-redux'
import {withRoute} from 'react-router5'
import classNames from 'classnames'
import TocIcon from 'material-ui-icons/Toc'
const mapState = (state, props) => {
  return {
    tasks: state.taskfiles[props.taskfile.id],
  }
}

const mapDispatch = ({taskfiles: {fetchTasks}}) => ({fetchTasks})

@withRoute
@withState('collapsed', 'setCollapsed', true)
@connect(mapState, mapDispatch)
class Taskfile extends Component {
  componentDidMount() {
    console.log('cDM:00', this.props.taskfile)
    this.props.fetchTasks({taskfileID: this.props.taskfile.id})
  }

  renderTasks(tasks) {
    const {router} = this.props
    const route = router.getState()

    console.log('router.params', route.params)
    return tasks.map((task) => {
      const classes = classNames({selected: route.params.name === task.name})
      return (
        <ListItem
          className={classes}
          key={task.name}
          onClick={this.doSetActive(task)}
        >
          <ListItemText primary={task.name} secondary={task.desc} />
        </ListItem>
      )
    })
  }

  render() {
    const {collapsed, setCollapsed, taskfile, tasks} = this.props
    return (
      <Fragment>
        <ListItem onClick={() => setCollapsed(!collapsed)}>
          <TocIcon />
          <ListItemText primary={taskfile.id} />
          {collapsed ? <ExpandMore /> : <ExpandLess />}
        </ListItem>
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <List>{tasks ? this.renderTasks(tasks) : 'Loading...'}</List>
        </Collapse>
      </Fragment>
    )
  }

  doSetActive = (task) => () => {
    const {router} = this.props
    router.navigate('tasks.name', {name: task.name})
  }
}

Taskfile.propTypes = {
  collapsed: PropTypes.bool,
  fetchTasks: PropTypes.func,
  router: PropTypes.object,
  setCollapsed: PropTypes.func,
  tasks: PropTypes.array,
  taskfile: PropTypes.object.isRequired,
}

export default Taskfile
