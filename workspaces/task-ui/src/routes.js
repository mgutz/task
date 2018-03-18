const routes = [
  {name: 'saved', path: '/saved'},
  {name: 'tasks', path: '/tasks'},
  // path appends to /tasks
  {name: 'tasks.name', path: '/:taskfileId/:taskName'},
  {name: 'tasks.name.history', path: '/:historyId'},
]

export default routes
