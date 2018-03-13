export const stylesheets = {
  run: ({sh}) => {
    sh.exec('react-toolbox-themr')
  },
}

export const server = {
  run: ({sh}) => {
    sh.exec('yarn start')
  },
}
