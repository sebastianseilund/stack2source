import test from 'ava'
import stack2source from '../'
import {setup, teardown} from './helpers/fake-sourcemaps'

test.before(setup)
test.after(teardown)

test('stack2source()', async t => {
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
