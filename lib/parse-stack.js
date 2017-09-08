const Stack = require('./stack')
const engines = [require('./engines/v8'), require('./engines/firefox')]

module.exports = function(rawStack) {
  rawStack = rawStack || ''
  const engine = engines.find(p => rawStack.match(p.DETECTOR_REGEX))
  if (engine) {
    return engine.parseStack(rawStack)
  } else {
    // Fall back to an empty stack with the whole rawStack as its message
    const stack = new Stack()
    stack.message = rawStack
    stack.frames = []
    return stack
  }
}
