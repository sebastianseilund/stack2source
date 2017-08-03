import test from 'ava'
import StackFrame from '../lib/stack-frame'

test('getters gives source precedence', t => {
  const frame = Object.assign(new StackFrame(), {
    parseStatus: 'ok',
    targetName: 'xyz',
    sourceName: 'getSomething',
    targetUrl: 'https://example.com/vendor.min.js',
    sourceUrl: 'https://example.com/vendor.js',
    targetLine: 42,
    sourceLine: 178,
    targetCol: 999,
    sourceCol: 4
  })
  t.is(frame.name, 'getSomething')
  t.is(frame.url, 'https://example.com/vendor.js')
  t.is(frame.line, 178)
  t.is(frame.col, 4)
})

test('getters falls back to target, when source is not set', t => {
  const frame = Object.assign(new StackFrame(), {
    parseStatus: 'ok',
    targetName: 'xyz',
    targetUrl: 'https://example.com/vendor.min.js',
    sourceUrl: 'https://example.com/vendor.js',
    targetLine: 42,
    targetCol: 999
  })
  t.is(frame.name, 'xyz')
  t.is(frame.url, 'https://example.com/vendor.js')
  t.is(frame.line, 42)
  t.is(frame.col, 999)
})

test('toString() for anonymous', t => {
  const frame = Object.assign(new StackFrame(), {
    parseStatus: 'ok',
    targetUrl: 'https://example.com/vendor.js',
    targetLine: 42,
    targetCol: 1
  })
  t.is(frame.toString(), '    at https://example.com/vendor.js:42:1')
})

test('toString() for named', t => {
  const frame = Object.assign(new StackFrame(), {
    parseStatus: 'ok',
    targetName: 'myFunction',
    targetUrl: 'https://example.com/vendor.js',
    targetLine: 42,
    targetCol: 1
  })
  t.is(
    frame.toString(),
    '    at myFunction (https://example.com/vendor.js:42:1)'
  )
})

test('toString() for raw', t => {
  const frame = Object.assign(new StackFrame(), {
    parseStatus: 'failed',
    raw: 'very weird frame'
  })
  t.is(frame.toString(), 'very weird frame')
})
