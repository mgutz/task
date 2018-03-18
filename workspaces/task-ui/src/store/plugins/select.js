export const select = {}

const selectPlugin = () => ({
  expose: {select},
  init: ({validate}) => ({
    onModel(model) {
      select[model.name] = {}
      Object.keys(model.selectors || {}).forEach((selectorName) => {
        validate([
          [
            typeof model.selectors[selectorName] !== 'function',
            `Selector (${model.name}/${selectorName}) must be a function`,
          ],
        ])
        select[model.name][selectorName] = (state, ...args) =>
          model.selectors[selectorName](state[model.name], ...args)
      })
    },
  }),
})

export default selectPlugin
