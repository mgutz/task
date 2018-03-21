import * as t from 'tcomb'
import {uid} from '#/util'

/**
 * Records history of whitelisted effects.
 */
const recordPlugin = (whitelist) => {
  return {
    expose: {
      effects: {},
    },
    init: ({dispatch}) => ({
      onModel(model) {
        const {name} = model
        const actions = dispatch[name]

        for (const key in actions) {
          const effect = actions[key]
          const action = `${name}/${key}`
          if (!effect.isEffect || whitelist.indexOf(action) < 0) continue

          const wrapper = async (payload) => {
            // ref is reference data used to build pretty history and navigate
            // properly

            const {ref, ...args} = payload

            //console.log('RECORDING', payload)
            const validate = t.struct({
              id: t.String,
              route: t.maybe(
                t.struct({
                  name: t.String,
                  params: t.Object,
                })
              ),
              kind: t.String,
              title: t.String,
            })
            validate(ref)

            const historyId = uid()

            const history = {
              id: historyId,
              createdAt: Date.now(),
              action,
              status: 'running',
              ref,
              args,
            }

            // add new history to application state for components to select it
            dispatch.taskfiles.record(history)

            // reference object can have many histories, set new one as active
            if (ref.id) {
              dispatch.activeHistories.setActiveHistory({
                oid: ref.id,
                historyId,
              })
            }

            // navigate to it, passing in the new historyId
            if (ref.route) {
              const {name, params} = ref.route
              if (name && params) {
                dispatch.router.navigate({name, params: {...params, historyId}})
              }
            }

            //console.log('RECORD running effect', {...args, historyId})
            return await effect({...args, historyId})
          }

          dispatch[name][key] = wrapper
        }
      },
    }),
  }
}

export default recordPlugin
