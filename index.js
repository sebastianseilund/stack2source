const parseStack = require('./lib/parse-stack')
const fetchSourcemaps = require('./lib/fetch-sourcemaps')
const translateFrames = require('./lib/translate-frames')

module.exports = function(rawStack, opts, callback) {
  opts = opts || {}
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  if (typeof callback == 'function') {
    run(rawStack, opts).then(stack => callback(null, stack), e => callback(e))
  } else {
    return run(rawStack, opts)
  }
}

function run(rawStack, opts) {
  return Promise.resolve(parseStack(rawStack))
    .then(stack => fetchSourcemaps(stack, opts))
    .then(stack => translateFrames(stack, opts))
}
