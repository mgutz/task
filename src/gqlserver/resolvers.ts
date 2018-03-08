export const tasks = () => {
  return [{name: 'foo'}, {name: 'bar'}]
}

interface RunParams {
  ref: string
}

export const run = ({ref}: RunParams) => {
  return {
    code: 0,
    message: '',
    payload: '',
  }
}
