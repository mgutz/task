import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {FlatList} from '#/components/styled'

const mapState = (state, props) => {
  const {task} = props
  return {
    chunks: state.logs[task.activePID],
  }
}

@connect(mapState)
export default class TaskLog extends React.PureComponent {
  static propTypes = {
    pid: PropTypes.number,
    chunks: PropTypes.array,
  }

  renderItem = ({item}) => {
    // eslint-disable-next-line
    const [_kind, lines] = item
    return (
      <pre>
        <code>{lines}</code>
      </pre>
    )
  }

  render() {
    const {chunks} = this.props
    if (!chunks) return null
    return <FlatList data={chunks} renderItem={this.renderItem} />
  }
}
