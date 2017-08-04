const fetch = require('isomorphic-fetch')
const isWhitelisted = require('./is-whitelisted')

module.exports = function(url, opts) {
  url = url || ''
  if (!url.match(/^https?:\/\//)) {
    const e = new Error(`URL is not an absolute HTTP/HTTPS URL: ${url}`)
    e.code = 'NotHttpUrl'
    return Promise.reject(e)
  }

  if (!isWhitelisted(url, opts.urlWhitelist)) {
    const e = new Error(`URL is not whitelisted: ${url}`)
    e.code = 'UrlNotWhitelisted'
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
