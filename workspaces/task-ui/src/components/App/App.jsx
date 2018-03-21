import './App.css'
import {connect} from 'react-redux'
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles'
import * as React from 'react'
import ProjectView from '../ProjectView'
import PropTypes from 'prop-types'

const theme = {
  palette: {
    primary: {
      main: '#8c6d62',
      light: '#bd9b8f',
      dark: '#5e4238',
      contrastText: '#fff',
    },
    secondary: {
      main: '#64b5f6',
      light: '#9be7ff',
      dark: '#2286c3',
      contrastText: '#000',
    },
  },
  typography: {
    //fontSize: 14,
    // Use the system font over Roboto.
    fontFamily:
      '"Maven Pro",-apple-system,system-ui,BlinkMacSystemFont,' +
      '"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  },
}

const muiTheme = createMuiTheme(theme)
const mapState = (state) => ({route: state.router.route})

@connect(mapState)
export default class App extends React.Component {
  static propTypes = {
    route: PropTypes.object,
  }

  render() {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="App">
          <ProjectView />
          <footer>footer</footer>
        </div>
      </MuiThemeProvider>
    )
  }
}
