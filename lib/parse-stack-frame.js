const StackFrame = require('./stack-frame')

module.exports = function(raw) {
  // TODO: Remove unused commented lines + remove group ()s from regex where not needed
  const frame = new StackFrame()
  frame.raw = raw
  const urlMatch = raw.match(/^(.+?)([^() ]+):(\d+):(\d+)(.*)$/)
  if (urlMatch) {
    const before = urlMatch[1] // TODO: Better name than `before`

    frame.parseStatus = 'ok'
    // frame.before = urlMatch[1]
    // frame.between = ''
    frame.targetUrl = frame.targetUrl = urlMatch[2]
    frame.targetLine = frame.targetLine = parseInt(urlMatch[3], 10)
    frame.targetCol = frame.targetCol = parseInt(urlMatch[4], 10)
    // frame.after = urlMatch[5]

    const nameMatch = before.match(/^(\s*at )([^ ]+)(.*)$/)
    if (nameMatch) {
      // frame.before = nameMatch[1]
      frame.targetName = nameMatch[2]
      // frame.between = nameMatch[3]
    } else {
      frame.targetName = undefined
    }
  } else {
    frame.parseStatus = 'failed'
  }
  return frame
}
