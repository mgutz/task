import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TaskHistory from './TaskHistory'

const mapDispatch = ({taskfiles: {run, stop}}) => ({run, stop})

@connect(null, mapDispatch)
export default class TaskActionBar extends React.PureComponent {
  static propTypes = {
    setShowForm: PropTypes.func,
    showForm: PropTypes.bool,
    run: PropTypes.func,
    stop: PropTypes.func,
    task: PropTypes.object.isRequired,
  }

  render() {
    const {task} = this.props
    return (
      <div>
        <TaskHistory task={task} />
      </div>
    )
  }

  standardizeSchema(schema) {
    return {...schema, type: 'object'}
  }
}
