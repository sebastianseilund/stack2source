import test from 'ava'
import {parseStack, parseStackFrame} from '../../lib/engines/v8'
import StackFrame from '../../lib/stack-frame'

test('parseStack: Single-line message', t => {
  const raw = [
    'Something funky happened',
    '    at https://example.com/vendor.js:11:222',
    '    at myFunction (https://example.com/app.js:33:444)'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.engine, 'v8')
  t.is(stack.message, 'Something funky happened')
  t.is(stack.frames.length, 2)
  t.deepEqual(
    stack.frames[0],
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw: '    at https://example.com/vendor.js:11:222',
      targetName: undefined,
      targetUrl: 'https://example.com/vendor.js',
      targetLine: 11,
      targetCol: 222
    })
  )
  t.deepEqual(
    stack.frames[1],
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw: '    at myFunction (https://example.com/app.js:33:444)',
      targetName: 'myFunction',
      targetUrl: 'https://example.com/app.js',
      targetLine: 33,
      targetCol: 444
    })
  )
})

test('parseStack: Multi-line message', t => {
  const raw = [
    'Something funky happened',
    'over',
    'many lines',
    '    at myFunction (https://example.com/app.js:33:444)'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.message, 'Something funky happened\nover\nmany lines')
  t.is(stack.frames.length, 1)
  t.is(stack.frames[0].targetName, 'myFunction')
})

test('parseStackFrame: Non-understood frame', t => {
  const raw = 'the dog jumped over the fox this time'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'failed',
      raw
    })
  )
})

test('parseStackFrame: Unnamed frame', t => {
  const raw = '    at https://example.com/app.js:11:222'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw,
      targetName: undefined,
      targetUrl: 'https://example.com/app.js',
      targetLine: 11,
      targetCol: 222
    })
  )
})

test('parseStackFrame: Named frame', t => {
  const raw = '    at myFunction (https://example.com/app.js:11:222)'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw,
      targetName: 'myFunction',
      targetUrl: 'https://example.com/app.js',
      targetLine: 11,
      targetCol: 222
    })
  )
})

test('parseStackFrame: only 3 spaces (Edge style)', t => {
  const raw = '   at myFunction (https://example.com/app.js:11:222)'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw,
      targetName: 'myFunction',
      targetUrl: 'https://example.com/app.js',
      targetLine: 11,
      targetCol: 222
    })
  )
})
