import * as _ from 'lodash'
import React, {Component} from 'react'
import SchemaFormDialog from './SchemaFormDialog'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import PlayCircleFilledIcon from 'material-ui-icons/PlayCircleFilled'
import IconButton from 'material-ui/IconButton'

const mapDispatch = ({taskfiles: {run}}) => ({run})

@connect(null, mapDispatch)
class RunTask extends Component {
  constructor(props) {
    super(props)
    this.state = {
      schema: _.get(props, 'task.ui.schema')
        ? standardizeSchema(props.task.ui.schema)
        : {},
      model: _.get(props, 'task.ui.model') ? props.task.ui.model : {},
      showForm: false,
    }
  }

  render() {
    if (!this.props.task) return null
    const {task} = this.props
    const {ui} = task
    const {model, schema, showForm} = this.state
    const hasForm = this.hasUI()
    const runFunc = hasForm ? this.doShowForm : this.doRun

    return (
      <div>
        {showForm &&
          hasForm && (
            <SchemaFormDialog
              schema={schema}
              form={ui.form}
              model={model}
              open={showForm}
              onClose={this.doCloseForm}
              onModelChange={this.doModelChange}
              onSubmit={this.doRun}
              maxWidth="md"
            />
          )}
        <IconButton onClick={runFunc}>
          <PlayCircleFilledIcon />
        </IconButton>
      </div>
    )
  }

  doCloseForm = () => {
    this.setState({showForm: false})
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
    this.setState({showForm: true})
  }

  hasUI() {
    const {task} = this.props
    return (
      task && task.ui && _.isObject(task.ui.schema) && _.isObject(task.ui.form)
    )
  }
}

RunTask.propTypes = {
  children: PropTypes.node,
  run: PropTypes.func,
  task: PropTypes.object,
}

const standardizeSchema = (schema) => {
  return {...schema, type: 'object'}
}

export default RunTask
