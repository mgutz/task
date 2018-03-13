import * as React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {List, ListSubHeader, ListItem} from '#/components/material'
import {withRoute} from 'react-router5'
import classNames from 'classnames'

const mapState = (state) => ({tasks: state.tasks})

const mapDispatch = ({tasks: {all}}) => ({all})

@withRoute
@connect(mapState, mapDispatch)
export default class TasksNav extends React.Component {
  static propTypes = {
    activeTaskName: PropTypes.string,
    all: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    tasks: PropTypes.array.isRequired,
  }
  componentWillMount() {
    this.props.all()
  }

  renderItems(tasks) {
    const {router, activeTaskName} = this.props
    const route = router.getState()

    console.log('router.params', route.params)

    return tasks.map((task) => {
      const classes = classNames({selected: route.params.name === task.name})
      return (
        <ListItem
          className={classes}
          key={task.name}
          caption={task.name}
          legend={task.desc}
          onClick={this.doSetActive(task)}
          ripple={false}
        />
      )
    })
  }

  render() {
    const {tasks} = this.props
    if (!tasks) return null
    return (
      <List selectable>
        <ListSubHeader caption="Tasks" />
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
