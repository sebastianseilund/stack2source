import test from 'ava'
import parseStack from '../lib/parse-stack'

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

test('V8 style stack', t => {
  const raw = [
    'Something funky happened',
    '    at https://example.com/vendor.js:11:222',
    '    at myFunction (https://example.com/app.js:33:444)'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.engine, 'v8')
  t.is(stack.message, 'Something funky happened')
  t.is(stack.frames.length, 2)
  t.is(stack.frames[0].name, undefined)
  t.is(stack.frames[1].name, 'myFunction')
})

test('Firefox style stack', t => {
  const raw = [
    '@https://example.com/vendor.js:11:222',
    'myFunction@https://example.com/app.js:33:444'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.engine, 'firefox')
  t.is(stack.message, undefined)
  t.is(stack.frames.length, 2)
  t.is(stack.frames[0].name, undefined)
  t.is(stack.frames[1].name, 'myFunction')
})
