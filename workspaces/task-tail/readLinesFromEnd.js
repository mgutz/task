// original source https://github.com/alexbbt/read-last-lines

const fs = require('fs')
const {promisify} = require('util')

const fsp = {
  close: promisify(fs.close),
  exists: promisify(fs.exists),
  open: promisify(fs.open),
  read: promisify(fs.read),
  stat: promisify(fs.stat),
}

/**
 * Read in the last `n` lines of a file
 * @param  {string}   inputFilePath - file (direct or relative path to file.)
 * @param  {int}      maxLineCount    - max number of lines to read in.
 * @param  {encoding} encoding        - specifies the character encoding to be used, or 'buffer'. defaults to 'utf8'.
 *
 * @return {promise}  a promise resolved with {lines: string, offset: number}
 */

function readLinesFromEnd(inputFilePath, maxLineCount, encoding) {
  const NEW_LINE_CHARACTERS = ['\n', '\r']

  if (encoding == null) {
    encoding = 'utf8'
  }

  const readPreviousChar = function(stat, file, currentCharacterCount) {
    return fsp
      .read(file, new Buffer(1), 0, 1, stat.size - 1 - currentCharacterCount)
      .then(({buffer}) => {
        return String.fromCharCode(buffer[0])
      })
  }

  return new Promise((resolve, reject) => {
    let self = {
      stat: null,
      file: null,
    }

    fsp
      .exists(inputFilePath)
      .then((exists) => {
        if (!exists) {
          throw new Error('file does not exist')
        }
      })
      .then(() => {
        let promises = []

        // Load file Stats.
        promises.push(
          fsp.stat(inputFilePath).then((stat) => (self.stat = stat))
        )

        // Open file for reading.
        promises.push(
          fsp.open(inputFilePath, 'r').then((file) => (self.file = file))
        )

        return Promise.all(promises)
      })
      .then(() => {
        let chars = 0
        let lineCount = 0
        let lines = ''

        const doWhileLoop = function() {
          if (lines.length > self.stat.size) {
            lines = lines.substring(lines.length - self.stat.size)
          }

          if (lines.length >= self.stat.size || lineCount >= maxLineCount) {
            if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
              lines = lines.substring(1)
            }
            fsp.close(self.file)

            const offset = self.stat.size - 1 - chars
            if (encoding === 'buffer') {
              return resolve({offset, lines: Buffer.from(lines, 'binary')})
            }
            return resolve({
              offset,
              lines: Buffer.from(lines, 'binary').toString(encoding),
            })
          }

          return readPreviousChar(self.stat, self.file, chars)
            .then((nextCharacter) => {
              lines = nextCharacter + lines
              if (
                NEW_LINE_CHARACTERS.includes(nextCharacter) &&
                lines.length > 1
              ) {
                lineCount++
              }
              chars++
            })
            .then(doWhileLoop)
        }
        return doWhileLoop()
      })
      .catch((reason) => {
        if (self.file !== null) {
          fsp.close(self.file)
        }
        return reject(reason)
      })
  })
}

module.exports = {readLinesFromEnd}
