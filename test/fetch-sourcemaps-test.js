import test from 'ava'
import parseStack from '../lib/parse-stack'
import fetchSourcemaps from '../lib/fetch-sourcemaps'
import {setup, teardown} from './helpers/fake-sourcemaps'

test.before(setup)
test.after(teardown)

async function frameMacro(
  t,
  rawFrame,
  expectedStatus,
  opts = {},
  frameCallback
) {
  const raw = ['Something funky happened', rawFrame].join('\n')
  const stack = parseStack(raw)

  await fetchSourcemaps(stack, opts)

  const frame = stack.frames[0]
  t.is(frame.sourcemapStatus, expectedStatus)
  if (frameCallback) {
    frameCallback(t, frame)
  }
}

async function urlMacro(t, targetUrl, expectedStatus, opts, frameCallback) {
  await frameMacro(
    t,
    `    at ${targetUrl}:1:100`,
    expectedStatus,
    opts,
    frameCallback
  )
}

test(
  'js and sourcemap exists',
  urlMacro,
  'https://example.com/vendor.js',
  'ok',
  {},
  (t, frame) => {
    t.is(frame.translateStatus, 'ok')
  }
)

test(
  'js and sourcemap exists, but code location is bad',
  frameMacro,
  '    at https://example.com/vendor.js:0:0',
  'ok',
  {},
  (t, frame) => {
    t.is(frame.translateStatus, 'not-found-in-sourcemap')
  }
)

test(
  'js has no sourcemap',
  urlMacro,
  'https://example.com/no-sourcemap.js',
  'no-sourcemap'
)

test(
  'js has sourcemap, which does not exist',
  urlMacro,
  'https://example.com/missing-sourcemap.js',
  'sourcemap-not-found'
)

test(
  'js does not exist',
  urlMacro,
  'https://example.com/does-not-exist.js',
  'js-not-found'
)

test('url is anonymous', urlMacro, '<anonymous>', 'js-not-http')

test(
  'js has wrong protocol',
  urlMacro,
  'ftp://example.com/vendor.js',
  'js-not-http'
)

test('js is not absolute', urlMacro, '/not/an/absolute/url.js', 'js-not-http')

test('js is empty string', urlMacro, '', 'js-not-http')

test(
  'js is not whitelisted',
  urlMacro,
  'https://not-example.com/app.js',
  'js-not-whitelisted',
  {
    urlWhitelist: ['https://example.com/']
  }
)

test(
  'sourcemap is not whitelisted',
  urlMacro,
  'https://example.com/sourcemap-on-different-host.js',
  'sourcemap-not-whitelisted',
  {
    urlWhitelist: ['https://example.com/']
  }
)

test('frame is raw', frameMacro, '    at weird looking frame', 'js-not-http')
