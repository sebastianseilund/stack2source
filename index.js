const parseStack = require('./lib/parse-stack')
const fetchSourcemaps = require('./lib/fetch-sourcemaps')
const translateFrames = require('./lib/translate-frames')

module.exports = function(rawStack, opts) {
  return Promise.resolve(parseStack(rawStack))
    .then(fetchSourcemaps)
    .then(translateFrames)
}
