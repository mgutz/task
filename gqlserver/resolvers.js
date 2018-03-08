const tasks = () => {
  console.log('tasks called')
  return [{name: 'foo'}, {name: 'bar'}]
}

const run = ({ref}) => {
  console.log('run called', ref)

  return {
    code: 0,
    message: '',
    payload: '',
  }
}

module.exports = {tasks, run}
