import test from 'ava'
import StackFrame from '../lib/stack-frame'

test('toString() for anonymous', t => {
  const frame = Object.assign(new StackFrame(), {
    url: 'https://example.com/vendor.js',
    line: 42,
    col: 1
  })
  t.is(frame.toString(), '    at https://example.com/vendor.js:42:1')
})

test('toString() for named', t => {
  const frame = Object.assign(new StackFrame(), {
    name: 'myFunction',
    url: 'https://example.com/vendor.js',
    line: 42,
    col: 1
  })
  t.is(
    frame.toString(),
    '    at myFunction (https://example.com/vendor.js:42:1)'
  )
})
