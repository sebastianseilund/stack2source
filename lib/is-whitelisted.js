module.exports = function(url, whitelist) {
  if (!whitelist || whitelist === '*') {
    return true
  }
  return whitelist.some(prefix => patternMatches(url, prefix))
}

function patternMatches(url, pattern) {
  if (typeof pattern === 'string') {
    return url.indexOf(pattern) === 0
  } else if (pattern instanceof RegExp) {
    return pattern.test(url)
  } else {
    throw new Error(`Invalid whitelist pattern: ${pattern}`)
  }
}
