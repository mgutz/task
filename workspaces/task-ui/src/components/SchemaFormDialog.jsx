import React from 'react'
import Button from 'material-ui/Button'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog'
import PropTypes from 'prop-types'
import {SchemaForm} from 'material-ui-schema-form'

export default class SchemaFormDialog extends React.PureComponent {
  static propTypes = {
    form: PropTypes.array.isRequired,
    model: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    open: PropTypes.bool,
    schema: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      model: {...props.model},
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('CWRP', nextProps)
  }

  render() {
    const {form, open, schema} = this.props
    const {model} = this.state

    return (
      <div>
        <Dialog
          disableBackdropClick={true}
          open={open}
          onClose={this.doClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <DialogContentText>Enter Args</DialogContentText>
            <SchemaForm
              schema={schema}
              form={form}
              model={model}
              onModelChange={this.doModelChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.doClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.doSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  doClose = () => {
    if (this.props.onClose) this.props.onClose()
  }

  doModelChange = (keyPath, v) => {
    // TODO The form returns multiple paths but for now we only accept shallow
    // objects
    this.setState((prev) => {
      return {...prev, model: {...prev.model, [keyPath[0]]: v}}
    })
  }

  doSubmit = () => {
    if (this.props.onClose) this.props.onClose()
    if (this.props.onSubmit) this.props.onSubmit(this.state.model)
  }
}
