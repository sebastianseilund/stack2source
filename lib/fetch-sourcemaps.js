const {SourceMapConsumer} = require('source-map')
const {URL} = require('whatwg-url')
const fetchFile = require('./fetch-file')

module.exports = function(stack) {
  // We only want to make one HTTP request per unique js file (targetUrl)
  // Build an array of all promises that we need to wait for
  const promises = []
  // ...and a map of targetUrl => sourcemap result (object with `status` and `sourcemap`)
  const results = {}

  stack.frames.forEach(({targetUrl}) => {
    // Check if we've already handled this targetUrl
    if (results[targetUrl] === undefined) {
      results[targetUrl] = null
      const promise = handleJsFile(targetUrl).then(result => {
        results[targetUrl] = result
      })
      promises.push(promise)
    }
    return promises
  })

  // Now wait for all the promises to resolve, and then put the results onto the stack frames
  return Promise.all(promises).then(() => {
    stack.frames.forEach(frame => {
      const {status, sourcemap} = results[frame.targetUrl]
      frame.sourcemapStatus = status
      frame.sourcemap = sourcemap
    })
    return stack
  })
}

function handleJsFile(targetUrl) {
  return fetchFile(targetUrl).then(
    js => extractSourcemap(targetUrl, js),
    e => {
      if (e.code === 'FetchFileError') {
        return {
          status: 'js-not-found'
        }
      } else if (e.code === 'NotHttpUrlError') {
        return {
          status: 'js-not-http'
        }
      }
      throw e
    }
  )
}

function extractSourcemap(jsUrl, js) {
  // TODO: Make sure we find the last one of these
  const match = js.match(/\/\/# sourceMappingURL=(.+)\s*$/)
  if (match) {
    const sourcemapUrl = absoluteUrl(match[1], jsUrl)
    return fetchFile(sourcemapUrl).then(
      text => ({
        status: 'ok',
        sourcemap: new SourceMapConsumer(text)
      }),
      e => {
        if (e.code === 'FetchFileError') {
          return {
            status: 'sourcemap-not-found'
          }
        } else if (e.code === 'NotHttpUrlError') {
          return {
            status: 'sourcemap-not-http'
          }
        }
        throw e
      }
    )
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
