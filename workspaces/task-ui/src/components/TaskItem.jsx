import * as React from 'react'
import styled from 'styled-components'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {withRoute} from 'react-router5'

const View = styled.div`
  padding: 10px;
`

const mapDispatch = ({tasks: {run}}) => ({run})

@withRoute
@connect(null, mapDispatch)
export default class TaskItem extends React.PureComponent {
  static propTypes = {
    router: PropTypes.object.isRequired,
    run: PropTypes.func.isRequired,
    task: PropTypes.object.isRequired,
  }

  render() {
    const {task} = this.props
    return <View onClick={this.doNavigate(task.name)}>{task.name}</View>
  }

  doNavigate = (name) => () => {
    const {router} = this.props
    router.navigate('tasks.name', {name})
  }
}
