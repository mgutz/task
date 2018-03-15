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
    const {ui} = task
    const isForm = this.hasUI()
    const runFunc = isForm ? this.doShowForm : this.doRun
    const schema = isForm ? this.standardizeSchema(ui.schema) : null

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
            schema={schema}
            form={ui.form}
            model={ui.model}
            open={showForm}
            onClose={this.doCloseForm}
            onModelChange={this.doModelChange}
            onSubmit={this.doRun}
            maxWidth="md"
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

  doRun = (model) => {
    const {run, task} = this.props
    const runArgs = [task.taskfileId, task.name]
    if (this.hasUI() && Object.keys(model).length > 0) {
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

  standardizeSchema(schema) {
    return {...schema, type: 'object'}
  }

  hasUI() {
    return !_.isEmpty(this.props.task.ui)
  }
}
