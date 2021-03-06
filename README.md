# stack2source

Maps JavaScript stack traces back to source using sourcemaps both in browsers and Node.

**Alpha software**

[![Build Status](https://travis-ci.org/sebastianseilund/stack2source.svg?branch=master)](https://travis-ci.org/sebastianseilund/stack2source)

## Differences to similar modules

- Works both in browsers and in Node.
- Returns more than just the translated stack as a string. It returns metadata about what could be translated and what could not. Useful for inspection.
- Not V8-specific (at least that's the goal).
- Only concerns itself with translation of stacks on-demand. Does not have any side effects, such as hooking into `Error`'s prototype.

## Installation

```
npm install stack2source
```

## Documentation

### Quickstart

```js
const stack2source = require('stack2source')

const inputStack = `Error: Something went wrong
    at https://my.domain.com/assets/vendor.min.js:2:17463
    at a (https://my.domain.com/assets/vendor.min.js:4:1828)
    at o (https://my.domain.com/assets/app.js:3:46272)
    at e (https://my.domain.com/assets/vendor.min.js:11:82728)
    at error-client-source: Unhandled promise rejection`

stack2source(inputStack, {
    urlWhitelist: [
      'https://my.domain.com/assets/'
    ]
  })
  .then(stack => {
    console.log(stack.toString())
  })
```

### `stack2source(input, [opts, callback])`

`input` is the raw stack to be parsed (a string). Stack2source will detect which JavaScript engine produced the stack, and use an appropriate parser.

`opts` is an object with the following keys:

- `urlWhitelist`: Defines the URLs stack2source is allowed to access when fetching JS- and sourcemap files. Can either be an array of path prefixes, an array of regular expressions, or a mix of prefixes and regular expressions. To allow all URLs (not recommended) set it to just the string `'*'`.
- `maxStackLength`: Sets an upper limit to the length of the `input` string argument. Will truncate `input` to this length if necessary. Defaults to `10000`.
- `maxUrls`: Sets an upper limit to the number of unique JS URLs that will be loaded. If the number is exceeded, the remaining frames will simply not be translated, but will have `sourcemapStatus = 'max-urls-exceeded'`. Defaults to `10`.

The result of `stack2source` is a `Stack` object. If `callback` is set and is a function, it will be invoked with the result. You can also omit `opts` and supply a callback function as the second argument. Otherwise a promise is returned, which resolves with the result.

### `Stack`

A `Stack` object represents a parsed stack trace.

Instead of just returning a transformed string, we return an object, so the status of each frame can be inspected. This is useful to tell which frames could be translated and which may have failed.

Instance properties:

- `engine`: String. The engine that was detected and used to parse the stack.
- `message`: String. The first line(s) of the input stack (the error message).
- `frames`: An array of `StackFrame` objects representing each frame in the stack.

#### `Stack.prototype.toString()`

Formats the stack as a string and returns it. If you just want to parse a stack string to a sourcemapped string, this is what you'll want to use. See Quickstart.

Currently always formats in V8-style. Even if the input stack was from e.g. Firefox.

### `StackFrame`

Represents a single frame in a stack. It contains information about whether the frame's source could be found, whether it had a sourcemap, whether the location could be translated etc.

Instance properties (TODO: Fill in):

- `raw`: String. The frame's raw string from the input stack. Typically on the form `'    at <name> (<url>:<line>:<col>)'`.
- `parseStatus`
- `sourcemapStatus`
- `translateStatus`
- `targetName`
- `sourceName`
- `name`
- `targetUrl`
- `sourceUrl`
- `url`
- `targetLine`
- `sourceLine`
- `line`
- `targetCol`
- `sourceCol`
- `col`

#### `StackFrame.prototype.toString()`

Formats the frame as a string and returns it. Used by `Stack.prototype.toString`.

## Examples

### Using regular expressions for `urlWhitelist`

```js
stack2source(inputStack, {
  urlWhitelist: [
    'https://my.domain.com/assets/',
    /ok-file.js/
  ]
})
```

### Allowing all URLs for `urlWhitelist`

```js
stack2source(inputStack, {
  urlWhitelist: '*'
})
```

## Browser/environment support

Tested with the following browsers/environments/engines:

- V8 style (`    at <name> (<url>:<line>:<col>)`)
  - Chrome
  - Node.js
  - Android Browser*
  - Opera 15+*
  - IE10+*
- Firefox style (`<name>@<url>:<line>:<col>`)
  - Firefox
  - Safari

* Needs verification

Issues/PRs for more support is encouraged.

## Roadmap

- Decorator for sourceUrl. E.g. strip `webpack://` prefix.
- Support for non-public sourcemaps. A way to transform the URL of the sourcemaps, or maybe even load them from disk (would only work in Node obviously).
- More browser/environment coverage.

Feel free to file an issue if you have other ideas.

## License

MIT
