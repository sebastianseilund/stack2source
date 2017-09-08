import test from 'ava'
import {parseStack, parseStackFrame} from '../../lib/engines/firefox'
import StackFrame from '../../lib/stack-frame'

test('parseStack', t => {
  const raw = [
    '@https://example.com/vendor.js:11:222',
    'myFunction@https://example.com/app.js:33:444'
  ].join('\n')
  const stack = parseStack(raw)
  t.is(stack.engine, 'firefox')
  t.is(stack.message, undefined)
  t.is(stack.frames.length, 2)
  t.deepEqual(
    stack.frames[0],
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw: '@https://example.com/vendor.js:11:222',
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
      raw: 'myFunction@https://example.com/app.js:33:444',
      targetName: 'myFunction',
      targetUrl: 'https://example.com/app.js',
      targetLine: 33,
      targetCol: 444
    })
  )
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
  const raw = '@https://example.com/app.js:11:222'
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
  const raw = 'myFunction@https://example.com/app.js:11:222'
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

test('parseStackFrame: With prefix space', t => {
  const raw = '    myFunction@https://example.com/app.js:11:222'
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
