import * as _ from 'lodash'
import React, {Component} from 'react'
import IconButton from 'material-ui/IconButton'
import KillIcon from 'material-ui-icons/BugReport'
import FormDialog from './FormDialog'
import {withState} from 'recompose'
import {TextField} from '#/components/formik'
import {Field, Formik} from 'formik'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {konsole} from '#/util'

const mapDispatch = ({histories: {kill}}) => ({kill})

@withState('showForm', 'setShowForm', false)
@connect(null, mapDispatch)
class ProcessTools extends Component {
  static propTypes = {
    kill: PropTypes.func.isRequired,
    setShowForm: PropTypes.func.isRequired,
    showForm: PropTypes.bool.isRequired,
  }

  renderForm() {
    const {setShowForm, showForm} = this.props
    return (
      <FormDialog
        buttonCaption="Kill"
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={this.doSubmit}
        title="Kill"
      >
        <Formik
          initialValues={{params: '', repeat: ''}}
          validate={this.doValidate}
        >
          {(formik) => {
            return (
              <form onSubmit={formik.handleSubmit}>
                <Field
                  component={TextField}
                  name="params"
                  label="Params"
                  placeholder="PID, name or :port"
                  margin="normal"
                />
                <Field
                  component={TextField}
                  name="repeat"
                  label="Repeat"
                  placeholder="Repeat to confirm"
                  margin="normal"
                />
              </form>
            )
          }}
        </Formik>
      </FormDialog>
    )
  }

  render() {
    return (
      <div>
        {this.renderForm()}
        <IconButton title="Kill" onClick={() => this.props.setShowForm(true)}>
          <KillIcon />
        </IconButton>
      </div>
    )
  }

  doSubmit = (form) => {
    const {setShowForm, kill} = this.props
    setShowForm(false)
    const argv = _.compact(form.params.split(','))
    if (!Array.isArray(argv)) {
      konsole.error('Invalid ARGV for kill.')
      return
    }
    kill({argv})
  }

  doValidate = (values) => {
    const errors = {}
    if (values.params !== values.repeat) {
      errors.repeat = 'Values do not match'
    }
    return errors
  }
}

export default ProcessTools
