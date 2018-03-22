import * as _ from 'lodash'
import React, {Component} from 'react'
import SchemaFormDialog from './SchemaFormDialog'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import PlayCircleFilledIcon from 'material-ui-icons/PlayCircleFilled'
import IconButton from 'material-ui/IconButton'
import {stopPropagation, taskSlug} from '#/util'

const mapDispatch = ({taskfiles: {run}}) => ({run})

@connect(null, mapDispatch)
class RunTask extends Component {
  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.node,
    navigate: PropTypes.func,
    run: PropTypes.func,
    setActiveHistory: PropTypes.func,
    task: PropTypes.object,
  }

  static defaultProps = {
    icon: <PlayCircleFilledIcon />,
  }

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
    const {icon, task} = this.props
    const {ui} = task
    const {model, schema, showForm} = this.state
    const hasForm = this.hasUI()
    const runFunc = hasForm ? this.doShowForm : this.doRunNoPropagation

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
        <IconButton onClick={runFunc}>{icon}</IconButton>
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

  doRunNoPropagation = (e) => {
    stopPropagation(e)
    this.doRun()
  }

  doRun = (model) => {
    const {run, task} = this.props
    const {taskfileId, name: taskName} = task
    const args = [taskfileId, taskName]
    if (this.hasUI() && Object.keys(model).length > 0) {
      args.push(model)
    }

    // where to navigate while running
    const title = taskSlug(task)

    run({
      args,

      // reference info for bookmarking
      ref: {
        id: task.id,
        kind: 'task',
        route: {
          name: 'tasks.name.history',
          params: {id: task.id, title, historyId: null}, // historyId filled in by middleware
        },
        title,
      },
    })
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

const standardizeSchema = (schema) => {
  return {...schema, type: 'object'}
}

export default RunTask
