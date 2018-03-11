export const routes = [
  {name: 'tasks', path: '/tasks'},
  // path appends to /tasks
  {name: 'tasks.name', path: '/:name'},
  {name: 'tasks.name.pid', path: '/:pid'},
]
