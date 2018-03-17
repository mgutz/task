import './sanitize.css'
import './index.css'
//import 'material-design-icons/iconfont/material-icons.css'
//import './assets/css/react-toolbox/theme.css'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'react-redux'
import {RouterProvider} from 'react-router5'
import {createStore} from './store'
import {createRouter} from './services/router'
// import theme from './assets/css/react-toolbox/theme'
// import ThemeProvider from 'react-toolbox/lib/ThemeProvider'

const main = async () => {
  const store = await createStore()
  const router = createRouter()

  // TODO: yeah this is a hack, i just want to get it  working, this needs to
  // be set somewhere else
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
  registerServiceWorker()
}

main()
