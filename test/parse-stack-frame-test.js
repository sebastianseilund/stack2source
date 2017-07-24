import test from 'ava'
import parseStackFrame from '../lib/parse-stack-frame'

test('Chrome style anonymous frame', t => {
  const raw = '    at https://example.com/app.js:11:222'
  const frame = parseStackFrame(raw)
  t.is(frame.parseStatus, 'ok')
  t.is(frame.raw, '    at https://example.com/app.js:11:222')
  t.is(frame.name, null)
  t.is(frame.url, 'https://example.com/app.js')
  t.is(frame.line, 11)
  t.is(frame.col, 222)
})

test('Chrome style named frame', t => {
  const raw = '    at myFunction (https://example.com/app.js:11:222)'
  const frame = parseStackFrame(raw)
  t.is(frame.parseStatus, 'ok')
  t.is(frame.raw, '    at myFunction (https://example.com/app.js:11:222)')
  t.is(frame.name, 'myFunction')
  t.is(frame.url, 'https://example.com/app.js')
  t.is(frame.line, 11)
  t.is(frame.col, 222)
})
