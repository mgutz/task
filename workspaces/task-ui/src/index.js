import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './containers/App'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'react-redux'
import {RouterProvider} from 'react-router5'
import {createStore} from './store'
import {client} from './services/websocket'
import {createRouter} from './services/router'

const store = createStore()
const router = createRouter()

// TODO: yeah this is a hack, i just want to get it  working, this needs to
// be set somewhere else
client.on('connect', () => {
  router.start(() => {
    ReactDOM.render(
      <Provider store={store}>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </Provider>,
      document.getElementById('root')
    )
  })
})

registerServiceWorker()
