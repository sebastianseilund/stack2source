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
      name: undefined,
      targetName: undefined,
      url: 'https://example.com/app.js',
      targetUrl: 'https://example.com/app.js',
      line: 11,
      targetLine: 11,
      col: 222,
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
      name: 'myFunction',
      targetName: 'myFunction',
      url: 'https://example.com/app.js',
      targetUrl: 'https://example.com/app.js',
      line: 11,
      targetLine: 11,
      col: 222,
      targetCol: 222
    })
  )
})
