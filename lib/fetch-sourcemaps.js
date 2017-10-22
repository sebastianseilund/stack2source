const {SourceMapConsumer} = require('source-map')
const {URL} = require('whatwg-url')
const fetchFile = require('./fetch-file')
const translateFrame = require('./translate-frame')

module.exports = function(stack, opts) {
  // We only want to make one HTTP request per unique js file (targetUrl)
  // Group frames by same targetUrl
  const groups = {}
  let urlCount = 0
  stack.frames.forEach(frame => {
    const jsUrl = frame.targetUrl

    if (!groups[jsUrl]) {
      // If we've exceeded maxUrls then skip the frame
      if (urlCount >= opts.maxUrls) {
        frame.sourcemapStatus = 'max-urls-exceeded'
        return
      }

      // Add a new jsUrl group
      urlCount++
      groups[jsUrl] = []
    }

    // Add the frame to the jsUrl group
    groups[jsUrl].push(frame)
  })

  // Handle each targetUrl and its frames in isolation
  const jsUrls = Object.keys(groups)
  return Promise.all(
    jsUrls.map(jsUrl => {
      const frames = groups[jsUrl]
      return handleJs(frames, jsUrl, opts)
    })
  ).then(() => stack)
}

function handleJs(frames, jsUrl, opts) {
  return fetchFile(jsUrl, opts).then(
    jsData => handleSourcemap(frames, jsUrl, jsData, opts),
    e => handleFetchFileError(frames, 'js', e)
  )
}

function handleSourcemap(frames, jsUrl, jsData, opts) {
  const smUrl = findSourcemapUrl(jsUrl, jsData)

  if (!smUrl) {
    frames.forEach(frame => {
      frame.sourcemapStatus = 'no-sourcemap'
    })
    return
  }

  return fetchFile(smUrl, opts).then(
    smData => translateFrames(frames, smData),
    e => handleFetchFileError(frames, 'sourcemap', e)
  )
}

function findSourcemapUrl(jsUrl, jsData) {
  // TODO: Make sure we find the last one of these
  // TODO: Support inline source maps?
  const match = jsData.match(/\/\/# sourceMappingURL=(.+)\s*$/)
  return match && absoluteUrl(match[1], jsUrl)
}

function translateFrames(frames, smData) {
  const sourcemap = new SourceMapConsumer(smData)
  frames.forEach(frame => {
    frame.sourcemapStatus = 'ok'
    translateFrame(frame, sourcemap)
  })
}

function absoluteUrl(url, base) {
  return new URL(url, base).toString()
}

function handleFetchFileError(frames, prefix, e) {
  let status
  if (e.code === 'FetchFileError') {
    status = 'not-found'
  } else if (e.code === 'NotHttpUrl') {
    status = 'not-http'
  } else if (e.code === 'UrlNotWhitelisted') {
    status = 'not-whitelisted'
  }
  if (status) {
    frames.forEach(frame => {
      frame.sourcemapStatus = `${prefix}-${status}`
    })
  } else {
    throw e
  }
}
