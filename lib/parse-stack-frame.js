const StackFrame = require('./stack-frame')

module.exports = function(raw) {
  // TODO: Remove unused commented lines + remove group ()s from regex where not needed
  const frame = new StackFrame()
  frame.raw = raw
  const urlMatch = raw.match(/^(.+?)([^() ]+):(\d+):(\d+)(.*)$/)
  if (urlMatch) {
    const before = urlMatch[1]

    frame.parseStatus = 'ok'
    // frame.before = urlMatch[1]
    frame.name = null
    // frame.between = ''
    frame.url = urlMatch[2]
    frame.line = parseInt(urlMatch[3], 10)
    frame.col = parseInt(urlMatch[4], 10)
    // frame.after = urlMatch[5]

    const nameMatch = before.match(/^(\s*at )([^ ]+)(.*)$/)
    if (nameMatch) {
      // frame.before = nameMatch[1]
      frame.name = nameMatch[2]
      // frame.between = nameMatch[3]
    }
  } else {
    frame.parseStatus = 'failed'
  }
  return frame
}
