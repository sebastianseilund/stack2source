const Stack = require('./stack')
const StackFrame = require('./stack-frame')

module.exports = function(rawStack) {
  const stack = new Stack()
  stack.message = ''
  stack.frames = []

  const lines = rawStack.split('\n')
  let framesStarted = false
  lines.forEach(line => {
    if (!framesStarted && line.startsWith('    at ')) {
      framesStarted = true
    }
    if (framesStarted) {
      stack.frames.push(parseFrame(line))
    } else {
      stack.message += (stack.message === '' ? '' : '\n') + line
    }
  })

  return stack
}

function parseFrame(raw) {
  const frame = new StackFrame()
  frame.raw = raw
  const urlMatch = raw.match(/^(.+?)([^() ]+):(\d+):(\d+)(.*)$/)
  if (urlMatch) {
    frame.parseStatus = 'parsed'
    frame.before = urlMatch[1]
    frame.targetName = null
    // frame.between = ''
    frame.targetUrl = urlMatch[2]
    frame.targetLine = parseInt(urlMatch[3], 10)
    frame.targetCol = parseInt(urlMatch[4], 10)
    // frame.after = urlMatch[5]

    const nameMatch = frame.before.match(/^(\s*at )([^ ]+)(.*)$/)
    if (nameMatch) {
      // frame.before = nameMatch[1]
      frame.targetName = nameMatch[2]
      // frame.between = nameMatch[3]
    }
  } else {
    frame.parseStatus = 'unknown'
  }
  return frame
}
