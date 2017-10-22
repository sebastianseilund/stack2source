module.exports = function(frame, sourcemap) {
  // Skip unparsed frames
  if (frame.parseStatus !== 'ok' || frame.sourcemapStatus !== 'ok') {
    return
  }

  let origPos
  let translateError
  try {
    origPos = sourcemap.originalPositionFor({
      line: frame.targetLine,
      column: frame.targetCol
    })
  } catch (e) {
    translateError = e.message
  }
  if (origPos) {
    frame.translateStatus = 'ok'
    frame.sourceName = origPos.name
    frame.sourceUrl = origPos.source
    frame.sourceLine = origPos.line
    frame.sourceCol = origPos.column
  } else {
    frame.translateStatus = 'not-found-in-sourcemap'
    frame.translateError = translateError
  }
}
