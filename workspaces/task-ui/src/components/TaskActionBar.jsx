import * as _ from 'lodash'
import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import TaskHistory from './TaskHistory'
import {IconButton} from '#/components/material'
import StopIcon from 'material-ui-icons/Stop'
import PlayArrowIcon from 'material-ui-icons/PlayArrow'
import SchemaFormDialog from './SchemaFormDialog'

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

  constructor() {
    super()
    this.state = {
      model: {},
      showForm: false,
    }
  }

  render() {
    const {task} = this.props
    const {showForm} = this.state
    const {form} = task
    const isForm = this.hasForm()
    const runFunc = isForm ? this.doShowForm : this.doRun

    return (
      <div>
        <IconButton onClick={this.doStop}>
          <StopIcon />
        </IconButton>
        <IconButton onClick={runFunc}>
          <PlayArrowIcon />
        </IconButton>

        <TaskHistory task={task} />

        {isForm && (
          <SchemaFormDialog
            schema={form.schema}
            form={form.form}
            model={{}}
            open={showForm}
            onClose={this.doCloseForm}
            onModelChange={this.doModelChange}
            onSubmit={this.doRun}
          />
        )}
      </div>
    )
  }

  doCloseForm = () => {
    this.setState({
      showForm: false,
    })
  }

  doModelChange = (key, value) => {
    this.setState((prevState) => {
      return {...prevState, model: {...prevState.model, [key]: value}}
    })
  }

  doRun = () => {
    const {run, task} = this.props
    const {model} = this.state
    const runArgs = [task.taskfileId, task.name]
    if (this.hasForm() && Object.keys(model).length > 0) {
      runArgs.push(model)
    }
    return run(runArgs)
  }

  doShowForm = () => {
    this.setState({
      showForm: true,
    })
  }

  doStop = () => {
    const {stop, task} = this.props
    stop([task.taskfileId, task.name])
  }

  hasForm() {
    return !_.isEmpty(this.props.task.form)
  }
}
