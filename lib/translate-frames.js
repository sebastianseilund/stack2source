// TODO: Name this differently than translate
module.exports = function(stack) {
  stack.frames.forEach(frame => {
    // Skip unparsed frames
    if (frame.parseStatus !== 'ok' || frame.sourcemapStatus !== 'ok') {
      return
    }

    const origPos = frame.sourcemap.originalPositionFor({
      line: frame.targetLine,
      column: frame.targetCol
    })
    if (origPos) {
      frame.translateStatus = 'ok'
      frame.sourceName = origPos.name
      frame.sourceUrl = origPos.source
      frame.sourceLine = origPos.line
      frame.sourceCol = origPos.column
    } else {
      frame.translateStatus = 'not-found-in-sourcemap'
    }
  })
  return stack
}
