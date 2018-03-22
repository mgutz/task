import React, {Component} from 'react'
import ListIcon from 'material-ui-icons/List'
import SettingsIcon from 'material-ui-icons/Settings'
import Flex, {FlexItem} from 'styled-flex-component'
import IconButton from 'material-ui/IconButton'
import {connect} from 'react-redux'
import {withState} from 'recompose'
import PropTypes from 'prop-types'

const mapState = (state) => ({route: state.router})

const mapDispatch = ({router: {navigate}}) => ({navigate})

@withState('activeIndex', 'setActiveIndex', 0)
@connect(mapState, mapDispatch)
class Modes extends Component {
  static propTypes = {
    activeIndex: PropTypes.number.isRequired,
    navigate: PropTypes.func.isRequired,
    setActiveIndex: PropTypes.func.isRequired,
  }
  constructor() {
    super()

    this.modes = [
      {label: 'Tasks', icon: <ListIcon />, routeName: 'tasks'},
      {label: 'Settings', icon: <SettingsIcon />, routeName: 'settings'},
    ]
  }

  renderItem = (mode, i) => {
    const {activeIndex} = this.props

    const classes = activeIndex === i ? 'is-selected' : null

    return (
      <FlexItem className={classes} key={i}>
        <IconButton onClick={this.doSelect(mode, i)}>{mode.icon}</IconButton>
      </FlexItem>
    )
  }

  render() {
    return (
      <Flex center column>
        {this.modes.map(this.renderItem)}
      </Flex>
    )
  }

  doSelect = (mode, i) => () => {
    const {navigate, setActiveIndex} = this.props
    setActiveIndex(i)
    navigate({name: mode.routeName})
  }
}

export default Modes
