import * as React from 'react'
import {connect} from 'react-redux'
import {FlatList} from '#/components/styled'
import TaskItem from './TaskItem'
import PropTypes from 'prop-types'

const mapState = (state) => ({tasks: state.tasks})

const mapDispatch = ({tasks: {all}}) => ({all})

@connect(mapState, mapDispatch)
export default class TasksNav extends React.Component {
  static propTypes = {
    all: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
  }
  componentWillMount() {
    this.props.all()
  }

  renderItem = ({item}) => {
    return <TaskItem task={item} />
  }

  render() {
    const {tasks} = this.props
    if (!tasks) return null
    return (
      <FlatList
        data={tasks}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
      />
    )
  }

  keyExtractor = (item) => item.name
}
