const tasks = () => {
  return [{name: 'foo'}, {name: 'bar'}]
}

const run = ({ref}) => {
  return {
    code: 0,
    message: '',
    payload: '',
  }
}

module.exports = {tasks, run}
