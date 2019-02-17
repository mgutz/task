import React from 'react'

import './sanitize.css'
import './index.css'
//import 'material-design-icons/iconfont/material-icons.css'
//import './assets/css/react-toolbox/theme.css'

import ReactDOM from 'react-dom'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'react-redux'
import {createStore} from './store'
// import theme from './assets/css/react-toolbox/theme'
// import ThemeProvider from 'react-toolbox/lib/ThemeProvider'

// import wdyu from 'why-did-you-update'
// wdyu(React)

const main = async () => {
  const store = await createStore()

  // TODO: yeah this is a hack, i just want to get it  working, this needs to
  // be set somewhere else
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )
  registerServiceWorker()
}

main()
