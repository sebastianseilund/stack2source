const {SourceMapConsumer} = require('source-map')
const {URL} = require('whatwg-url')
const fetchFile = require('./fetch-file')
const translateFrame = require('./translate-frame')

module.exports = function(stack, opts) {
  // We only want to make one HTTP request per unique js file (targetUrl)
  // Build an array of all promises that we need to wait for
  const promises = []
  // ...and a map of targetUrl => sourcemap result (object with `status` and `sourcemap`)
  const results = {}

  stack.frames.forEach(frame => {
    const {targetUrl} = frame

    // Check if we've already handled this targetUrl
    if (results[targetUrl] !== undefined) {
      return
    }

    // Check if we've exceeded maxUrls
    if (promises.length >= opts.maxUrls) {
      frame.sourcemapStatus = 'max-urls-exceeded'
      return
    }

    results[targetUrl] = null
    const promise = handleJsFile(targetUrl, opts).then(result => {
      results[targetUrl] = result
    })
    promises.push(promise)
  })

  // Now wait for all the promises to resolve, and then put the results onto the stack frames
  return Promise.all(promises).then(() => {
    stack.frames.forEach(frame => {
      // Skip frames that already got a sourcemapStatus (e.g. if maxUrls was exceeded)
      if (frame.sourcemapStatus) {
        return
      }

      // Translate the frame using the sourcemap
      const {status, sourcemap} = results[frame.targetUrl]
      frame.sourcemapStatus = status
      translateFrame(frame, sourcemap)
    })
    return stack
  })
}

function handleJsFile(targetUrl, opts) {
  return fetchFile(targetUrl, opts).then(
    js => extractSourcemap(targetUrl, js, opts),
    e => handleFetchFileError('js', e)
  )
}

function extractSourcemap(jsUrl, js, opts) {
  // TODO: Make sure we find the last one of these
  const match = js.match(/\/\/# sourceMappingURL=(.+)\s*$/)
  if (match) {
    const sourcemapUrl = absoluteUrl(match[1], jsUrl)
    return fetchFile(sourcemapUrl, opts).then(
      text => ({
        status: 'ok',
        sourcemap: new SourceMapConsumer(text)
      }),
      e => handleFetchFileError('sourcemap', e)
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

function handleFetchFileError(prefix, e) {
  if (e.code === 'FetchFileError') {
    return {
      status: `${prefix}-not-found`
    }
  } else if (e.code === 'NotHttpUrl') {
    return {
      status: `${prefix}-not-http`
    }
  } else if (e.code === 'UrlNotWhitelisted') {
    return {
      status: `${prefix}-not-whitelisted`
    }
  }
  throw e
}
