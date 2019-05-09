import * as fs from 'fs'
import * as pify from 'pify'

export const readFile = pify(fs.readFile)
export const writeFile = pify(fs.writeFile)
export const stat = pify(fs.stat)

// Returns a boolean so different than access
export const canAccess = async (filename: string, mode: number) => {
  return new Promise((resolve, _reject) => {
    fs.access(filename, mode, (err) => resolve(!Boolean(err)))
  })
}

// Returns true if filename is readable
export const isReadable = async (filename: string) => {
  return new Promise((resolve, _reject) => {
    fs.access(filename, fs.constants.R_OK, (err) => resolve(!Boolean(err)))
  })
}

// Returns true if filename is writable
export const isWritable = async (filename: string) => {
  return new Promise((resolve, _reject) => {
    fs.access(filename, fs.constants.W_OK, (err) => resolve(!Boolean(err)))
  })
}
