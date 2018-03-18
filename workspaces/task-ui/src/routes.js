const routes = [
  {name: 'bookmarks', path: '/bookmarks'},
  {name: 'bookmarks.title', path: '/:title/:id'},
  {name: 'bookmarks.title.history', path: '/:historyId'},

  {name: 'tasks', path: '/tasks'},
  {name: 'tasks.name', path: '/:taskfileId/:taskName/:id'},
  {name: 'tasks.name.history', path: '/:historyId'},
]

export default routes
