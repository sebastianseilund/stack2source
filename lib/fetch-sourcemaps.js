const {SourceMapConsumer} = require('source-map')
const {URL} = require('url') // TODO: Make sure this isn't loaded in browsers (use window.URL)
const fetchFile = require('./fetch-file')

module.exports = function(stack) {
  const seen = {}
  const promises = []
  const results = {}
  stack.frames.forEach(({targetUrl}) => {
    if (targetUrl && !seen[targetUrl]) {
      seen[targetUrl] = true
      const promise = fetchFile(targetUrl)
        .then(js => extractSourcemap(targetUrl, js))
        .then(sourcemap => {
          results[targetUrl] = sourcemap
        })
      promises.push(promise)
    }
    return promises
  })
  return Promise.all(promises).then(() => results)
}

function extractSourcemap(jsUrl, js) {
  // TODO: Make sure we find the last one of these
  const match = js.match(/\/\/# sourceMappingURL=(.+)\s*$/)
  if (match) {
    const sourcemapUrl = absoluteUrl(match[1], jsUrl)
    return fetchFile(sourcemapUrl).then(text => ({
      found: true,
      consumer: new SourceMapConsumer(text)
    }))
  } else {
    // TODO: Support inline source maps?
    return Promise.resolve({
      found: false
    })
  }
}

function absoluteUrl(url, base) {
  return new URL(url, base).toString()
}
