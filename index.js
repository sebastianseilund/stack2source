const parseStack = require('./lib/parse-stack')
const fetchSourcemaps = require('./lib/fetch-sourcemaps')

/**
 * @typedef Options
 * @param {string|string[]|RegExp[]} urlWhitelist
 * @param {number} maxStackLength
 */

/**
 * @param {string} rawStack
 * @param {Options} opts
 * @param {Function} callback
 * @returns {Promise|undefined}
 */
module.exports = function(rawStack, opts, callback) {
  // Normalize arguments
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  // Normalize and validate options
  opts = opts || {}
  opts.maxStackLength = opts.maxStackLength || 10000
  if (!opts.urlWhitelist) {
    return Promise.reject(
      'stack2source\'s `urlWhitelist` option is required. It\'s recommended to set it to an array with prefixes of all paths your JS- and sourcemap files exist on. Example: `urlWhitelist: [\'http://my.domain.com/assets/\']`. Or you can set it to \'*\' to allow all URLs.'
    )
  }

  // Validate rawStack
  if (typeof rawStack !== 'string') {
    return Promise.reject(
      'The first argument supplied to stack2source() must be a string.'
    )
  }
  if (rawStack.length > opts.maxStackLength) {
    const ellipsis = '...(truncated by stack2source)'
    const end = opts.maxStackLength - ellipsis.length
    rawStack = rawStack.substring(0, end) + ellipsis
  }

  // Run using either Promise- or callback-style
  if (typeof callback == 'function') {
    run(rawStack, opts).then(stack => callback(null, stack), e => callback(e))
  } else {
    return run(rawStack, opts)
  }
}

/**
 * @param {string} rawStack
 * @param {Options} opts
 * @returns {Promise}
 */
function run(rawStack, opts) {
  return Promise.resolve(parseStack(rawStack)).then(stack =>
    fetchSourcemaps(stack, opts)
  )
}
