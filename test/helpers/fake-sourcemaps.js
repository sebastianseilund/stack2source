const nock = require('nock')
const {SourceMapGenerator} = require('source-map')

const host = 'https://example.com'

function setup() {
  // With working sourcemap
  setupJs('vendor.js', 'vendor.js.map')
  setupSourcemap('vendor.js', [
    [1, 100, 'lodash.js', 'each', 111, 11],
    [2, 200, 'moment.js', 'format', 222, 22]
  ])

  // Another with working sourcemap
  setupJs('app.js', 'app.js.map')
  setupSourcemap('app.js', [
    [1, 100, 'index.js', 'main', 111, 11],
    [2, 200, 'helpers.js', undefined, 222, 22]
  ])

  // Without a sourcemap
  setupJs('no-sourcemap.js', null)

  // With sourcemap that does not exist
  setupJs('missing-sourcemap.js', 'missing-sourcemap.js.map')
  setup404('missing-sourcemap.js.map')

  // JS file that does not exist
  setup404('does-not-exist.js')
}

function teardown() {
  nock.cleanAll()
  nock.restore()
}

function setupJs(file, sourcemap) {
  const key = 'sourceMappingURL'
  let body = `var fake = '${file}'`
  if (sourcemap) {
    body += `\n\n//# ${key}=${host}/${sourcemap}`
  }
  nock(host).persist().get(`/${file}`).reply(200, body)
}

function setupSourcemap(file, mappings) {
  var map = new SourceMapGenerator({
    file: `${host}/${file}`
  })
  mappings.forEach(([gline, gcol, source, name, oline, ocol]) => {
    map.addMapping({
      generated: {line: gline, column: gcol},
      source: `webpack://${source}`,
      original: {line: oline, column: ocol},
      name
    })
  })
  const body = map.toString()
  nock(host).persist().get(`/${file}.map`).reply(200, body)
}

function setup404(file) {
  nock(host).persist().get(`/${file}`).reply(404, 'Not Found')
}

module.exports = {
  setup,
  teardown
}
