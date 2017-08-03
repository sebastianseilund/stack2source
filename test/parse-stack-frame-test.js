import test from 'ava'
import parseStackFrame from '../lib/parse-stack-frame'
import StackFrame from '../lib/stack-frame'

test('Non-understood frame', t => {
  const raw = 'the dog jumped over the fox this time'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'failed',
      raw: 'the dog jumped over the fox this time'
    })
  )
})

test('Chrome style anonymous frame', t => {
  const raw = '    at https://example.com/app.js:11:222'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw: '    at https://example.com/app.js:11:222',
      targetName: undefined,
      targetUrl: 'https://example.com/app.js',
      targetLine: 11,
      targetCol: 222
    })
  )
})

test('Chrome style named frame', t => {
  const raw = '    at myFunction (https://example.com/app.js:11:222)'
  const frame = parseStackFrame(raw)
  t.deepEqual(
    frame,
    Object.assign(new StackFrame(), {
      parseStatus: 'ok',
      raw: '    at myFunction (https://example.com/app.js:11:222)',
      targetName: 'myFunction',
      targetUrl: 'https://example.com/app.js',
      targetLine: 11,
      targetCol: 222
    })
  )
})
