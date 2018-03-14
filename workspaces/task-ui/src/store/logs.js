import producer from './producer'

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
  // {[pid]: [{indices: [], chunks[]}, }
  state: {},

  reducers: {
    'taskfiles/appendLog': producer((draft, payload) => {
      const {pid, lines, kind} = payload
      const spid = String(pid)
      let info = draft[spid]
      if (!info) {
        info = {indices: [], chunks: []}
        draft[spid] = info
      }

      const indices = parseLFIndices(lines)
      const pos = info.chunks.length
      for (const ind of indices) {
        const offset = info.indices.length
        info.indices.length = offset + 4
        // pos=chunk index
        // ind[0]=start
        // ind[1]=length
        // kind=0 is stdout 1 is stderr
        info.indices[offset] = pos
        info.indices[offset + 1] = ind[0]
        info.indices[offset + 2] = ind[1]
        info.indices[offset + 3] = kind
      }
      info.chunks.push(lines)
      return
    }),
  },

  // async action creators
  effects: {},
}

/**
 * Parses a string for line feeds recording the start of each line and its length.
 */
const parseLFIndices = (s) => {
  const result = []

  if (!s) return []

  let curr = 0

  let idx = s.indexOf('\n', curr)
  while (idx > -1) {
    // push start and length of line
    result.push([curr, idx - curr])
    curr = idx + 1
    idx = s.indexOf('\n', curr)
  }

  // this removes blank lines
  if (s.length - curr > 0) {
    result.push([curr, s.length - curr])
  }
  return result
}

const tryParse = (s) => {
  try {
    return JSON.parse(s)
  } catch (err) {
    return {msg: s}
  }
}

export const logEntryAt = ({indices, chunks}, index) => {
  const offset = index * 4
  const chunksPos = indices[offset]
  const start = indices[offset + 1]
  const length = indices[offset + 2]
  const kind = indices[offset + 3]

  const s = chunks[chunksPos].substr(start, length)
  if (s.startsWith('{') && s.endsWith('}')) {
    const o = tryParse(s)
    o._kind_ = kind
    return o
  }
  return {m: s, _kind_: kind}
}

export const logLength = (logIndex) => {
  return logIndex.indices.length / 4
}
