const {SourceMapConsumer} = require('source-map')
const {URL} = require('url') // TODO: Make sure this isn't loaded in browsers (use window.URL)
const fetchFile = require('./fetch-file')

module.exports = function(stack) {
  const promises = []
  const results = {}
  stack.frames.forEach(({targetUrl}) => {
    if (targetUrl && results[targetUrl] === undefined) {
      results[targetUrl] = null
      const promise = fetchFile(targetUrl)
        .then(js => extractSourcemap(targetUrl, js))
        .then(sourcemap => {
          results[targetUrl] = sourcemap
        })
      promises.push(promise)
    }
    return promises
  })
  return Promise.all(promises).then(() => {
    stack.frames.forEach(frame => {
      const {status, sourcemap} = results[frame.targetUrl]
      frame.sourcemapStatus = status
      frame.sourcemap = sourcemap
    })
    return stack
  })
}

function extractSourcemap(jsUrl, js) {
  // TODO: Make sure we find the last one of these
  const match = js.match(/\/\/# sourceMappingURL=(.+)\s*$/)
  if (match) {
    // TODO: Handle fetch errors (should be status = sourcemap-fetch-failed)
    const sourcemapUrl = absoluteUrl(match[1], jsUrl)
    return fetchFile(sourcemapUrl).then(text => ({
      status: 'ok',
      sourcemap: new SourceMapConsumer(text)
    }))
  } else {
    // TODO: Support inline source maps?
    return Promise.resolve({
      status: 'no-sourcemap'
    })
  }
}

function absoluteUrl(url, base) {
  return new URL(url, base).toString()
}
