import * as _ from 'lodash'
import * as fp from 'path'
import * as pkgUp from 'pkg-up'
import * as rollup from 'rollup'

import {isReadable, stat} from '../core/promise/fs'

import {trace} from '../core/log'

const tempFile = (_argv: Options, taskfile: string) => {
  const dir = fp.dirname(taskfile)
  const base = '.tasktmp-' + fp.basename(taskfile, fp.extname(taskfile))

  return {dir, base}
}

const compiledFile = (argv: Options, taskfile: string) => {
  const {dir, base} = tempFile(argv, taskfile)
  return fp.join(dir, base + '.js')
}

// Determines whether the task file should be recompiled by rollup. This is
// not robust! It only checks the current task file, compiled file and
// package.json for changes. Anything imported locally is not considered. In
// those cases, task can be forced to recompile with `--compile` flag.
export const shouldCompile = async (argv: Options, taskfilePath: string) => {
  const compileFile = compiledFile(argv, taskfilePath)
  if (!(await isReadable(compileFile))) {
    trace('Compile file not readable', compileFile)
    return true
  }

  const statTaskFile = await stat(taskfilePath)
  const statCompileFile = await stat(compileFile)

  if (statTaskFile.mtime > statCompileFile.mtime) {
    trace('Task file is newer than compile file', compileFile)
    return true
  }

  const nearestPackageFile = await pkgUp()
  const statPackageFile = await stat(nearestPackageFile)
  if (statCompileFile.mtime < statPackageFile.mtime) {
    trace('Compile file is older than package file', {
      compileFile,
      nearestPackageFile,
    })
    return true
  }

  return false
}

/**
 * Build conditionally builds the task file. The task file is rebuilt when
 *
 * - --compile flag is set on CLI
 * - compiled file does not exist
 * - task file is newer than compiled file
 * - compiled file is older than nearest package file
 */
export const build = async (argv: Options, taskfilePath: string) => {
  const {dir, base} = tempFile(argv, taskfilePath)
  const compileFile = compiledFile(argv, taskfilePath)
  const isCompile = argv.compile || (await shouldCompile(argv, taskfilePath))

  if (isCompile) {
    const relative = (path: string) => fp.relative(dir, path)
    trace(`Compiling ${relative(taskfilePath)} to ${relative(compileFile)}`)
    const bundle = await rollup.rollup({
      input: {[base]: taskfilePath},
      plugins: [],
    })
    await bundle.write({dir, format: 'cjs'})
  } else {
    trace('Skipping up-to-date', compileFile)
  }

  return compileFile
}
