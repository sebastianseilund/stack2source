module.exports = function(stack, sourcemaps) {
  stack.frames.forEach(frame => {
    // Skip unparsed frames
    if (frame.parseStatus !== 'parsed') {
      return
    }

    const {targetUrl} = frame

    const sourcemap = sourcemaps[targetUrl]
    if (sourcemap.found) {
      const origPos = sourcemap.consumer.originalPositionFor({
        line: frame.targetLine,
        column: frame.targetCol
      })
      if (origPos) {
        frame.sourcemapStatus = 'found'
        if (frame.targetName) {
          frame.sourceName = origPos.name
        }
        frame.sourceUrl = origPos.source
        frame.sourceLine = origPos.line
        frame.sourceCol = origPos.column
      } else {
        frame.sourcemapStatus = 'not-found-in-sourcemap'
      }
    } else {
      frame.sourcemapStatus = 'sourcemap-not-found'
    }
  })
  return stack
}
