import test from 'ava'
import stack2source from '../'
import {setup, teardown} from './helpers/fake-sourcemaps'

test.before(setup)
test.after(teardown)

test('stack2source() in promise mode', async t => {
  const raw = [
    'Something funky happened',
    '    at e (https://example.com/vendor.js:1:100)',
    '    at https://example.com/app.js:2:200'
  ].join('\n')
  const stack = await stack2source(raw, {
    urlWhitelist: ['https://example.com/']
  })
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      '    at each (webpack://lodash.js:111:11)\n' +
      '    at webpack://helpers.js:222:22'
  )
})

test.cb('stack2source() in callback mode', t => {
  t.plan(2)
  const raw = [
    'Something funky happened',
    '    at e (https://example.com/vendor.js:1:100)',
    '    at https://example.com/app.js:2:200'
  ].join('\n')
  const opts = {
    urlWhitelist: ['https://example.com/']
  }
  stack2source(raw, opts, (err, stack) => {
    t.is(err, null)
    t.is(
      stack.toString(),
      'Something funky happened\n' +
        '    at each (webpack://lodash.js:111:11)\n' +
        '    at webpack://helpers.js:222:22'
    )
    t.end()
  })
})

test('with missing whitelist', async t => {
  await t.throws(
    stack2source('Some error'),
    /stack2source's `urlWhitelist` option is required/
  )
})

test('with truncated stack', async t => {
  const raw = [
    'Something funky happened',
    '    at e (https://example.com/vendor.js:1:100)',
    '    at https://examp',
    '...'
  ].join('\n')
  const stack = await stack2source(raw, {
    urlWhitelist: ['https://example.com/']
  })
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      '    at each (webpack://lodash.js:111:11)\n' +
      '    at https://examp\n' +
      '...'
  )
})

test('with non-whitelisted urls', async t => {
  const raw = [
    'Something funky happened',
    '    at e (https://not-example.com/vendor.js:1:100)'
  ].join('\n')
  const stack = await stack2source(raw, {
    urlWhitelist: ['https://example.com/']
  })
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      '    at e (https://not-example.com/vendor.js:1:100)'
  )
})

test('with too large input string', async t => {
  // Make a string consisting of 10 chars per line (including newline)
  // Make it have 11 lines so it will be truncated
  const lines = ['123456789']
  for (let i = 0; i < 10; i++) {
    lines.push('    at 89')
  }
  const raw = lines.join('\n')

  // Take 3 full lines, one line of 8 chars and then the ellipsis (30 chars)
  const maxStackLength = 3 * 10 + 1 * 8 + 30
  const stack = await stack2source(raw, {
    urlWhitelist: '*',
    maxStackLength
  })

  const expected = [
    '123456789',
    '    at 89',
    '    at 89',
    '    at 8...(truncated by stack2source)'
  ].join('\n')
  t.is(expected.length, maxStackLength)
  t.is(stack.toString(), expected)
})

test('when maxUrls is exceeded', async t => {
  const raw = [
    'Something funky happened',
    '    at e (https://example.com/vendor.js:1:100)',
    '    at https://example.com/common.js:1:100',
    '    at https://example.com/app.js:2:200',
    '    at e (https://example.com/vendor.js:2:200)'
  ].join('\n')
  const stack = await stack2source(raw, {
    urlWhitelist: ['https://example.com/'],
    maxUrls: 2
  })
  t.is(
    stack.toString(),
    [
      'Something funky happened',
      '    at each (webpack://lodash.js:111:11)',
      '    at usefulHelper (webpack://util.js:111:11)',
      '    at https://example.com/app.js:2:200',
      '    at format (webpack://moment.js:222:22)'
    ].join('\n')
  )
})
