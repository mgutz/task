import * as React from 'react'
import {connect} from 'react-redux'

export interface Props {
  task: Task
}

export class TaskItem extends React.PureComponent {
  render() {
    return <div>TaskItem</div>
  }
}
