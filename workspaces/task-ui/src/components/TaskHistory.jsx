import * as _ from 'lodash'
import * as React from 'react'
import PropTypes from 'prop-types'
import {FlatList} from '#/components/styled'
import {connect} from 'react-redux'

const mapState = (state, props) => {
  const taskName = _.get(props, 'task.name')
  return {
    histories: state.history[taskName],
  }
}

@connect(mapState)
export default class TaskHistory extends React.PureComponent {
  static propTypes = {
    task: PropTypes.object,
    histories: PropTypes.array,
  }

  renderItem = ({item}) => {
    return (
      <span>
        {item.pid} - {item.status}
      </span>
    )
  }

  render() {
    const {histories} = this.props
    return (
      <FlatList
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        data={histories}
      />
    )
  }

  keyExtractor = (item) => {
    return item.pid
  }
}
