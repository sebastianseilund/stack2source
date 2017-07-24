const Stack = require('./stack')
const parseStackFrame = require('./parse-stack-frame')

module.exports = function(rawStack) {
  const stack = new Stack()
  stack.message = ''
  stack.frames = []

  const lines = (rawStack || '').split('\n')
  let framesStarted = false
  lines.forEach(line => {
    if (!framesStarted && line.startsWith('    at ')) {
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
