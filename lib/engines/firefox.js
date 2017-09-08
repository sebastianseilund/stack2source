const Stack = require('../stack')
const StackFrame = require('../stack-frame')

/**
 * Firefox stacks do not contain the error message. They consist of a line for
 * each frame. A frame concists of a name, a @ char, a url, a colon, the line,
 * another colon and the column.
 *
 * Example:
 * `<name>@<url>:<line>:<col>`
 *
 * In some cases a frame can have extra information after the column number. We
 * currently do not include this.
 *
 * Other browsers covered by the same format:
 *
 * - Safari
 */

const DETECTOR_REGEX = /@[^\s]+:\d+:\d+/

function parseStack(rawStack) {
  const stack = new Stack()
  stack.engine = 'firefox'
  stack.message = undefined
  stack.frames = rawStack.split('\n').map(parseStackFrame)
  return stack
}

function parseStackFrame(raw) {
  const frame = new StackFrame()
  frame.raw = raw
  const urlMatch = raw.match(/^(.*)@(.+?):(\d+):(\d+)/)
  if (urlMatch) {
    frame.parseStatus = 'ok'
    frame.targetName = urlMatch[1] || undefined
    frame.targetUrl = frame.targetUrl = urlMatch[2]
    frame.targetLine = frame.targetLine = parseInt(urlMatch[3], 10)
    frame.targetCol = frame.targetCol = parseInt(urlMatch[4], 10)
  } else {
    frame.parseStatus = 'failed'
  }
  return frame
}

module.exports = {DETECTOR_REGEX, parseStack, parseStackFrame}
