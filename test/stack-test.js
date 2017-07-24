import test from 'ava'
import Stack from '../lib/stack'
import StackFrame from '../lib/stack-frame'

test('toString()', t => {
  const stack = Object.assign(new Stack(), {
    message: 'Something funky happened',
    frames: [
      Object.assign(new StackFrame(), {
        name: 'myFunction',
        url: 'https://example.com/vendor.js',
        line: 42,
        col: 1
      }),
      Object.assign(new StackFrame(), {
        url: 'https://example.com/app.js',
        line: 765,
        col: 123
      })
    ]
  })
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      '    at myFunction (https://example.com/vendor.js:42:1)\n' +
      '    at https://example.com/app.js:765:123'
  )
})

test('toString() with multi-line messages', t => {
  const stack = Object.assign(new Stack(), {
    message: 'Something funky happened\nand it was\non multiple lines',
    frames: [
      Object.assign(new StackFrame(), {
        url: 'https://example.com/app.js',
        line: 765,
        col: 123
      })
    ]
  })
  t.is(
    stack.toString(),
    'Something funky happened\n' +
      'and it was\n' +
      'on multiple lines\n' +
      '    at https://example.com/app.js:765:123'
  )
})