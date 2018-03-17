import * as React from 'react'
import './App.css'
import ProjectView from '#/containers/ProjectView'
import {routeNode} from 'react-router5'
import Info from '#/components/Info'
import PropTypes from 'prop-types'
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
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
      main: '#26c6da',
      light: '#6ff9ff',
      dark: '#0095a8',
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

@routeNode('')
export default class App extends React.Component {
  static propTypes = {
    route: PropTypes.object,
  }

  render() {
    const {route} = this.props
    let body =
      route && route.name.startsWith('tasks') ? <ProjectView /> : <Info />
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
          {body}
          <footer>footer</footer>
        </div>
      </MuiThemeProvider>
    )
  }
}
