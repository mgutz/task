import * as React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {
  Button,
  List,
  ListSubHeader,
  ListItem,
  ListItemText,
} from '#/components/material'
import {withRoute} from 'react-router5'
import classNames from 'classnames'
import AddIcon from 'material-ui-icons/Add'

const mapState = (state) => ({tasks: state.tasks})

const mapDispatch = ({project: {load}}) => ({loadProject: load})

@withRoute
@connect(mapState, mapDispatch)
export default class TasksNav extends React.Component {
  static propTypes = {
    activeTaskName: PropTypes.string,
    loadProject: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    tasks: PropTypes.array.isRequired,
  }
  componentWillMount() {
    this.props.loadProject()
  }

  renderItems(tasks) {
    const {router} = this.props
    const route = router.getState()

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
    const {tasks} = this.props
    if (!tasks) return null
    return (
      <List>
        <ListSubHeader>
          <Button variant="fab" mini color="secondary" aria-label="add">
            <AddIcon />
          </Button>{' '}
          Tasks
        </ListSubHeader>
        {this.renderItems(tasks)}
      </List>
    )
  }

  doSetActive = (task) => () => {
    const {router} = this.props
    router.navigate('tasks.name', {name: task.name})
  }

  keyExtractor = (item) => item.name
}
