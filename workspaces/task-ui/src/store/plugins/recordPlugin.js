import * as t from 'tcomb'
import {uid} from '#/util'

/*

To make an action recordable

1) Add action to whitelist, eg whitelist = ['taskfiles/run']
2) A `ref` object must be passed to the action to associate the callsite to the
   saved record. The ref contains presentation information such as title and id
   to the original task or bookmark.
*/

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
            // ref has meta to the original task, bookmark, etc

            const historyId = uid()
            const {ref, ...args} = payload
            if (!ref) return effect({...args, historyId})

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

            const record = {
              id: historyId,
              createdAt: Date.now(),
              action,
              status: 'running',
              // a new record was created, insert into the route for UI to
              // update properly
              ref: {
                ...ref,
                route: {
                  ...ref.route,
                  params: {
                    ...ref.route.params,
                    historyId,
                  },
                },
              },
              args,
            }

            // add new history to application state for components to select it
            dispatch.taskfiles.record(record)

            // reference object can have many histories, set new one as active
            if (ref.id) {
              dispatch.activeHistories.setActiveHistory({
                oid: ref.id,
                historyId,
              })
            }

            // navigate to it, passing in the new historyId
            if (ref.route) {
              const {route} = record.ref
              if (route.name) {
                dispatch.router.navigate(route)
              }
            }

            //console.log('RECORD running effect', {...args, historyId})
            return effect({...args, historyId})
          }

          dispatch[name][key] = wrapper
        }
      },
    }),
  }
}

export default recordPlugin
