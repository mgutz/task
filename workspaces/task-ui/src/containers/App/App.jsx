import * as React from 'react'
import './App.css'
import TaskView from '#/containers/TaskView'
import {routeNode} from 'react-router5'
import Info from '#/components/Info'
import PropTypes from 'prop-types'

@routeNode('')
export default class App extends React.Component {
  static propTypes = {
    route: PropTypes.object,
  }

  render() {
    const {route} = this.props
    let body = route && route.name.startsWith('tasks') ? <TaskView /> : <Info />
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Task</h1>
        </header>
        {body}
        <footer>footer</footer>
      </div>
    )
  }
}
