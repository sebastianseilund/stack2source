const fetch = require('isomorphic-fetch')

module.exports = function fetchFile(url) {
  if (!(url || '').match(/^https?:\/\//)) {
    const e = new Error(`URL is not an absolute HTTP/HTTPS URL: ${url}`)
    e.code = 'NotHttpUrlError'
    return Promise.reject(e)
  }

  return fetch(url).then(res => {
    if (res.ok) {
      return res.text()
    } else {
      const e = new Error(`Could not fetch ${url}`)
      e.code = 'FetchFileError'
      throw e
    }
  })
}
