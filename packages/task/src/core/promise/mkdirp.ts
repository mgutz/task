import * as mkdir from 'mkdirp'
import * as pify from 'pify'

export const mkdirp = pify(mkdir)
