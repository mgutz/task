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
    onModelChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    open: PropTypes.bool,
    schema: PropTypes.object.isRequired,
  }

  render() {
    const {form, model, onModelChange, open, schema} = this.props

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
              onModelChange={onModelChange}
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

  doSubmit = () => {
    if (this.props.onClose) this.props.onClose()
    if (this.props.onSubmit) this.props.onSubmit()
  }
}
