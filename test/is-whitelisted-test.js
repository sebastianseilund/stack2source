import test from 'ava'
import isWhitelisted from '../lib/is-whitelisted'

test('with *', t => {
  t.truthy(isWhitelisted('http://anything.com/yes', '*'))
})

test('with array with prefix', t => {
  const whitelist = ['http://example.com/assets/']

  t.truthy(isWhitelisted('http://example.com/assets/app.js', whitelist))
  t.truthy(isWhitelisted('http://example.com/assets/deeper/file.js', whitelist))

  t.falsy(isWhitelisted('http://example.com/assetsapp.js', whitelist))
  t.falsy(isWhitelisted('http://notexample.com/asset/sapp.js', whitelist))
  t.falsy(isWhitelisted('wat http://example.com/asset/sapp.js', whitelist))
})

test('with array with regexp', t => {
  const whitelist = [/abc/]

  t.truthy(isWhitelisted('http://example.com/assets/abc.js', whitelist))
  t.truthy(isWhitelisted('http://abc.com/assets/deeper/file.js', whitelist))

  t.falsy(isWhitelisted('http://example.com/assets/app.js', whitelist))
})

test('with array with multiple patterns', t => {
  const whitelist = [/abc/, 'http://example.com/assets/']

  t.truthy(isWhitelisted('http://abc.com/fun.js', whitelist))
  t.truthy(isWhitelisted('http://example.com/assets/app.js', whitelist))

  t.falsy(isWhitelisted('http://abd.com/assets/app.js', whitelist))
})
