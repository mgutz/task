import './App.css'
import {connect} from 'react-redux'
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles'
import * as React from 'react'
import AppBar from 'material-ui/AppBar'
import ProjectView from '#/containers/ProjectView'
import PropTypes from 'prop-types'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

const theme = {
  palette: {
    primary: {
      main: '#8c6d62',
      light: '#bd9b8f',
      dark: '#5e4238',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4fc3f7',
      light: '#8bf6ff',
      dark: '#0093c4',
      contrastText: '#000',
    },
  },
  typography: {
    htmlFontSize: 14,
    // Use the system font over Roboto.
    fontFamily:
      'Oxygen,-apple-system,system-ui,BlinkMacSystemFont,' +
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
    // const {route} = this.props
    // let body =
    //   route && route.name.startsWith('tasks') ? <ProjectView /> : <Info />
    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className="App">
          <header className="App-header">
            <AppBar color="primary" elevation={0} position="static">
              <Toolbar>
                <Typography color="inherit" variant="title">
                  Task
                </Typography>
              </Toolbar>
            </AppBar>
          </header>
          <ProjectView />
          <footer>footer</footer>
        </div>
      </MuiThemeProvider>
    )
  }
}
