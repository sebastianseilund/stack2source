module.exports = function fetchFrameSourcemaps(stack) {
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
  return Promise.all(promises)
    .then(() => results)
}
