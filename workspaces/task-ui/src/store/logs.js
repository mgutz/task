// DO NOT USE producer here, logs can get very large

/**
 * We don't want to break up the data that comes in with split or do any
 * concatenating. Imagine a 400MB log file. Splitting it would require
 * and additinoal (400MB + data structure overhead). Instead we
 * record where start of each line is and its length in a chunk found
 * in chunks. A chunk can be multi-line string.
 *
 *  lineIndices: [chunkIndex, startPos, length, kind, ...]
 *  chunks: [string1, string2, string3]
 *
 * For example:
 *
 *  chunks: ["foo\nbar", "bah\napple"]
 *  indices: [
 *      0, 0, 3, 0,     // chunks[0], start=0, length=3, out
 *      0, 5, 3, 0,     // chunks[0], start=5, length=3, out
 *      1, 0, 3, 0,     // chunks[1], start=0, length=3, out
 *      1, 5, 5, 0      // chunks[1], start=5, length=5, out
 *  ]
 */
export const logs = {
  // {[pid: string]: [{indices: [], chunks[]}, ... }
  state: {},

  reducers: {
    'taskfiles/appendLog': (state, payload) => {
      const {id, lines, kind} = payload
      const key = String(id)
      const found = state[key]

      const chunkPos = found ? found.chunks.length : 0
      const lfIndices = parseLFIndices(lines)
      const addIndices = []
      // 2 indexes used in returned lfIndices for each line
      // 4 indexes used to store info about each chunk
      addIndices.length = lfIndices.length / 2 * 4
      for (
        let lfOffset = 0, offset = 0;
        lfOffset < lfIndices.length;
        lfOffset += 2, offset += 4
      ) {
        addIndices[offset] = chunkPos
        addIndices[offset + 1] = lfIndices[lfOffset]
        addIndices[offset + 2] = lfIndices[lfOffset + 1]
        addIndices[offset + 3] = kind
      }

      if (!found) {
        //info = {indices: [], chunks: []}
        return {...state, [key]: {indices: addIndices, chunks: [lines]}}
      }
      return {
        ...state,
        [key]: {
          indices: [].concat(found.indices, addIndices),
          chunks: [].concat(found.chunks, lines),
        },
      }
    },
  },

  // async action creators
  effects: {},
}

/**
 * Parses a string for line feeds recording the start of each line and its length.
 *
 * Returns an array [start, length, start1, length1, ..., startN, lengthN]
 */
const parseLFIndices = (s) => {
  if (!s) return []
  const result = []
  let curr = 0
  let idx = s.indexOf('\n', curr)
  while (idx > -1) {
    // push start and length of line
    result.push(curr, idx - curr)
    curr = idx + 1
    idx = s.indexOf('\n', curr)
  }

  // this removes blank lines. TODO should there be a retain option?
  if (s.length - curr > 0) {
    result.push(curr, s.length - curr)
  }
  return result
}

const tryParse = (s) => {
  try {
    return JSON.parse(s)
  } catch (err) {
    return {_msg_: s}
  }
}

/**
 *
 * Gets log entry at index. _msg_ and _kind_ props are added and named
 * to avoid conflict.
 */
export const logEntryAt = ({indices, chunks}, index) => {
  const offset = index * 4
  const chunksPos = indices[offset]
  const start = indices[offset + 1]
  const length = indices[offset + 2]
  const kind = indices[offset + 3]

  const s = chunks[chunksPos].substr(start, length)
  if (s[0] === '{') {
    const o = tryParse(s)
    o._kind_ = kind
    return o
  }
  return {_msg_: s, _kind_: kind}
}

export const logLength = (logIndex) => {
  return logIndex.indices.length / 4
}
