import test from 'ava'
import parseStack from '../lib/parse-stack'

// TODO: Multiline messages

test('when stack is empty string', t => {
  const stack = parseStack('')
  t.is(stack.message, '')
  t.is(stack.frames.length, 0)
})

test('when stack is null', t => {
  const stack = parseStack(null)
  t.is(stack.message, '')
  t.is(stack.frames.length, 0)
})

test('when stack is undefined', t => {
  const stack = parseStack(undefined)
  t.is(stack.message, '')
  t.is(stack.frames.length, 0)
})

test('Chrome style stack', t => {
  const raw = [
    'Something bad happened',
    '    at https://example.com/vendor.js:11:222',
    '    at myFunction (https://example.com/app.js:33:444)'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.message, 'Something bad happened')
  t.is(stack.frames.length, 2)

  let frame

  frame = stack.frames[0]
  t.is(frame.parseStatus, 'ok')
  t.is(frame.raw, '    at https://example.com/vendor.js:11:222')
  t.is(frame.name, null)
  t.is(frame.url, 'https://example.com/vendor.js')
  t.is(frame.line, 11)
  t.is(frame.col, 222)

  frame = stack.frames[1]
  t.is(frame.parseStatus, 'ok')
  t.is(frame.raw, '    at myFunction (https://example.com/app.js:33:444)')
  t.is(frame.name, 'myFunction')
  t.is(frame.url, 'https://example.com/app.js')
  t.is(frame.line, 33)
  t.is(frame.col, 444)
})
