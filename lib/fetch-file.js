const fetch = require('isomorphic-fetch')

module.exports = function fetchFile(url) {
  return fetch(url).then(res => {
    if (res.ok) {
      return res.text()
    } else {
      throw new Error(`Could not load ${url}`)
    }
  })
}
