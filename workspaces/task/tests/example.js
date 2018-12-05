/* eslint-disable no-console */

export const sleep = async (ms) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms)
  })
}

export const name = async ({prompt}) => {
  const answers = await prompt([{name: 'name', message: 'Name'}])
  console.log(`Hello, ${answers.name}!`)
}

export const clean = async () => {
  await sleep(1)
  console.log('clean')
}

export const build = {
  deps: [clean],
  run: () => {
    console.log('build')
  },
}

export const arg = ({argv}) => {
  console.log(argv._[0])
}

export const docs = () => {
  console.log('building docs')
}

// use shell spawn (shawn) to gracefully restart daemons
export const server = {
  run: async ({shawn}) => {
    return shawn(`node src/main.js`)
  },
  watch: ['src/**.js'],
}

export default {
  // runs `name` then ['clean', 'build'] and `docs` in parallel
  deps: [name, {p: [build, docs]}],
}

// lifecycle hook to run before all tasks (only once)
export const _before = (taskContext) => {}
