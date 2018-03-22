import * as _ from 'lodash'
import React, {Fragment, Component} from 'react'
import PropTypes from 'prop-types'
import Collapse from 'material-ui/transitions/Collapse'
import List, {ListItem, ListItemIcon, ListItemText} from 'material-ui/List'
import {withState} from 'recompose'
import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'
import {connect} from 'react-redux'
import TocIcon from 'material-ui-icons/Toc'
import styled from 'styled-components'
import RunTask from './RunTask'
import {select} from '@rematch/select'
import {taskSlug} from '#/util'
import Activate from './Activate'

const InsetList = styled(List)`
  padding-left: 10px;
`

const Ellipsis = styled.span`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
`

const mapState = (state, props) => {
  return {
    tasks: select.taskfiles.tasksByFileId(state, props.taskfile.id),
  }
}
const mapDispatch = ({taskfiles: {fetchTasks}}) => ({
  fetchTasks,
})

@withState('collapsed', 'setCollapsed', true)
@connect(mapState, mapDispatch)
class Taskfile extends Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    fetchTasks: PropTypes.func,
    setCollapsed: PropTypes.func,
    tasks: PropTypes.array,
    taskfile: PropTypes.object.isRequired,
  }

  renderTasks(tasks) {
    return tasks.map((task) => {
      // some tasks should only be run from CLI
      const hide = _.get(task, 'ui.hide')
      if (hide) return null

      const route = {
        name: 'tasks.name',
        params: {id: task.id, title: taskSlug(task)},
      }

      return (
        <Activate class="is-selected" route={route} key={task.name}>
          <ListItem title={task.desc}>
            <ListItemText
              primary={task.name}
              secondary={<Ellipsis>{task.desc}</Ellipsis>}
            />
            <ListItemIcon>
              <RunTask task={task} />
            </ListItemIcon>
          </ListItem>
        </Activate>
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
}

export default Taskfile
