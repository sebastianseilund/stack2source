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
  const stack = await stack2source(raw)
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      '    at each (webpack://lodash.js:111:11)\n' +
      '    at webpack://helpers.js:222:22'
  )
})
