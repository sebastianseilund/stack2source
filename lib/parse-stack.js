const Stack = require('./stack')
const engines = [require('./engines/v8'), require('./engines/firefox')]

module.exports = function(rawStack) {
  rawStack = rawStack || ''

  // Find the best matching engine. We count the number of occurences of
  // plausible stacks using each engine's DETECTOR_REGEX. Whichever has the most
  // occurrences wins.
  let bestEngine
  let bestScore = 0
  engines.forEach(engine => {
    const match = rawStack.match(engine.DETECTOR_REGEX)
    if (match) {
      const score = match.length
      if (score > bestScore) {
        bestEngine = engine
        bestScore = score
      }
    }
  })

  if (bestEngine) {
    return bestEngine.parseStack(rawStack)
  } else {
    // Fall back to an empty stack with the whole rawStack as its message
    const stack = new Stack()
    stack.message = rawStack
    stack.frames = []
    return stack
  }
}
