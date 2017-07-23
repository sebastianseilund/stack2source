const parseStack = require('./lib/parse-stack')
const fetchSourcemaps = require('./lib/fetch-sourcemaps')
const translateFrames = require('./lib/translate-frames')

module.exports = function(rawStack, opts) {
  return Promise.resolve(parseStack(rawStack))
    .then(stack => fetchSourcemaps(stack, opts))
    .then(stack => translateFrames(stack, opts))
}
