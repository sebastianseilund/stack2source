const Stack = require('../stack')
const StackFrame = require('../stack-frame')

/**
 * V8 (Chrome, Android, Opera 15+, Node.js) stacks consist of a multiline error
 * message followed by a line for each frame. A frame starts with 4 spaces, the
 * word "at" and then another space. From here there are multiple formats:
 *
 * Unnamed:
 * `    at <url>:<line>:<col>`
 *
 * Named (notice how the url, line and col are wrapped in parantheses):
 * `    at <name> (<url>:<line>:<col>)`
 *
 * Supposedly IE10+ and Edge use the same format, except they put only 3 spaces
 * in front of the `at`. XXX Check needed.
 */

// V8 uses 4 spaces, Edge uses 3 spaces. Support both.
const DETECTOR_REGEX = /\n {3,4}at /g

function parseStack(rawStack) {
  const stack = new Stack()
  stack.engine = 'v8'
  stack.message = ''
  stack.frames = []

  const lines = rawStack.split('\n')
  let framesStarted = false
  lines.forEach(line => {
    if (!framesStarted && line.match(/^ {3,4}at /)) {
      framesStarted = true
    }
    if (framesStarted) {
      stack.frames.push(parseStackFrame(line))
    } else {
      stack.message += (stack.message === '' ? '' : '\n') + line
    }
  })

  return stack
}

function parseStackFrame(raw) {
  const frame = new StackFrame()
  frame.raw = raw
  const urlMatch = raw.match(/^(.+?)([^() ]+):(\d+):(\d+)/)
  if (urlMatch) {
    const possibleName = urlMatch[1]

    frame.parseStatus = 'ok'
    frame.targetUrl = frame.targetUrl = urlMatch[2]
    frame.targetLine = frame.targetLine = parseInt(urlMatch[3], 10)
    frame.targetCol = frame.targetCol = parseInt(urlMatch[4], 10)

    const nameMatch = possibleName.match(/^\s*at ([^ ]+)/)
    if (nameMatch) {
      frame.targetName = nameMatch[1]
    } else {
      frame.targetName = undefined
    }
  } else {
    frame.parseStatus = 'failed'
  }
  return frame
}

module.exports = {DETECTOR_REGEX, parseStack, parseStackFrame}
