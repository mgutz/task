export const trace = (store) => (next) => (action) => {
  console.log('Middleware triggered:', action)
  next(action)
}
