const parseStack = require('./lib/parse-stack')
const fetchSourcemaps = require('./lib/fetch-sourcemaps')

module.exports = function(rawStack, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = opts || {}
  if (!opts.urlWhitelist) {
    return Promise.reject(
      'stack2source\'s `urlWhitelist` option is required. It\'s recommended to set it to an array with prefixes of all paths your JS- and sourcemap files exist on. Example: `urlWhitelist: [\'http://my.domain.com/assets/\']`. Or you can set it to \'*\' to allow all URLs.'
    )
  }

  if (typeof callback == 'function') {
    run(rawStack, opts).then(stack => callback(null, stack), e => callback(e))
  } else {
    return run(rawStack, opts)
  }
}

function run(rawStack, opts) {
  return Promise.resolve(parseStack(rawStack)).then(stack =>
    fetchSourcemaps(stack, opts)
  )
}
