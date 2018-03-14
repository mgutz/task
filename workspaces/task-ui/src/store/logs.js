import producer from './producer'

/**
 * We don't want to break up the data that comes in with split or do any
 * concatenating. Imagine a 400MB log file. Splitting it would require
 * and additinoal (400MB + data structure overhead). Instead we
 * record
 *
 *  lineIndices: [[chunkIndex, startPos, length, kind], ...]
 *  chunks: [string1, string2, string3]
 *
 * For example:
 *
 *  chunks: ["foo\nbar", "bah\napple"]
 *  lindices: [[0, 0, 3, 0], [0, 5, 3, 0], [1, 0, 3, 0], [1 5, 5, 0]]
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
        const length = ind[1]
        if (length < 1) continue
        // pos=position of chunk which is at the end
        // ind[0]=start
        // ind[1]=length
        // kind=0 is stdout 1 is stderr
        info.indices.push([pos, ind[0], length, kind])
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

  result.push([curr, s.length - curr])
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
  // yeah i know this is same as [v1, v2, v3, v4] = indices[index]
  const info = indices[index]
  const chunksPos = info[0]
  const start = info[1]
  const length = info[2]
  const kind = info[3]

  const s = chunks[chunksPos].substr(start, length)
  if (s.startsWith('{') && s.endsWith('}')) {
    const o = tryParse(s)
    o._kind_ = kind
    return o
  }
  return {m: s, _kind_: kind}
}

export const logLength = (logIndex) => {
  return logIndex.indices.length
}
