import React, {Component} from 'react'
import {InputAdornment} from 'material-ui/Input'
import TextField from 'material-ui/TextField'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {withState} from 'recompose'

const mapState = (state) => ({result: state.api.findProcessResult})
const mapDispatch = ({api: {findProcess}}) => ({findProcess})

@withState('keyword', 'setKeyword', '')
@connect(mapState, mapDispatch)
class FindProcess extends Component {
  static propTypes = {
    keyword: PropTypes.string,
    findProcessResult: PropTypes.array.isRequired,
    findProcess: PropTypes.func.isRequired,
    setKeyword: PropTypes.func.isRequired,
  }

  renderForm() {
    const {keyword, setKeyword} = this.props

    return (
      <TextField
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" onClick={this.doSearch}>
              search
            </InputAdornment>
          ),
        }}
      />
    )
  }

  render() {
    return this.renderForm()
  }

  doSearch = () => {
    const {keyword, findProcess} = this.props
    if (!keyword) return
    findProcess({keyword})
  }
}

export default FindProcess
