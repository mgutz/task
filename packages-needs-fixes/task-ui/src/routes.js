const routes = [
  {name: 'bookmarks', path: '/bookmarks'},
  {name: 'bookmarks.title', path: '/:title/:id'},
  {name: 'bookmarks.title.history', path: '/history/:historyId'},

  {name: 'settings', path: '/settings'},

  {name: 'tasks', path: '/tasks'},
  {name: 'tasks.name', path: '/:title/:id'},
  {name: 'tasks.name.history', path: '/history/:historyId'},
]

export default routes
