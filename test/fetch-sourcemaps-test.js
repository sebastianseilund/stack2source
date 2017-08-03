import test from 'ava'
import parseStack from '../lib/parse-stack'
import fetchSourcemaps from '../lib/fetch-sourcemaps'
import {setup, teardown} from './helpers/fake-sourcemaps'

test.before(setup)
test.after(teardown)

async function macro(t, targetUrl, expectedStatus) {
  const raw = ['Something funky happened', `    at ${targetUrl}:1:100`].join(
    '\n'
  )
  const stack = parseStack(raw)

  await fetchSourcemaps(stack)

  const frame = stack.frames[0]
  t.is(frame.sourcemapStatus, expectedStatus)
  if (expectedStatus === 'ok') {
    t.truthy(frame.sourcemap)
  } else {
    t.falsy(frame.sourcemap)
  }
}

test('js and sourcemap exists', macro, 'https://example.com/vendor.js', 'ok')

test(
  'js has no sourcemap',
  macro,
  'https://example.com/no-sourcemap.js',
  'no-sourcemap'
)

test(
  'js has sourcemap, which does not exist',
  macro,
  'https://example.com/missing-sourcemap.js',
  'sourcemap-not-found'
)

test(
  'js does not exist',
  macro,
  'https://example.com/does-not-exist.js',
  'js-not-found'
)

test('url is anonymous', macro, '<anonymous>', 'js-not-http')

test(
  'js has wrong protocol',
  macro,
  'ftp://example.com/vendor.js',
  'js-not-http'
)

test('js is not absolute', macro, '/not/an/absolute/url.js', 'js-not-http')

test('js is empty string', macro, '', 'js-not-http')
