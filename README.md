# rx

> A regular expression template tag written in TypeScript

[![Test status on Travis](https://badgen.net/travis/loilo/rx?label=Linux&icon=travis)](https://travis-ci.org/loilo/rx)
[![Test status on AppVeyor](https://badgen.net/appveyor/ci/loilo/rx?label=Windows&icon=appveyor)](https://ci.appveyor.com/project/loilo/rx)
[![Version on npm](https://badgen.net/npm/v/@loilo/rx)](https://www.npmjs.com/package/@loilo/rx)

## Motivation

Regular expressions are a tool needed fairly often in the web world — mostly due to JavaScript's lackluster ability to do string matching/searching/replacing.

However, writing regular expressions gets messy very quickly as soon as any third party input is involved. User-provided strings have to be escaped and the convenient regex literals give way to a way more unwieldy [`RegExp`] constructor.

After struggling with this for years, it crossed my mind ([and the mind of many others](#credit)) that this might be solved pretty comfortably with a tagged template literal:

```ts
import rx from '@loilo/rx'

const disallowedWindowsFilenameChars = rx`[${'<>:"/\\|?*'}]`

if (disallowedWindowsFilenameChars.test(someFilename)) {
  console.error('Invalid characters in filename')
} else {
  console.log("You're probably fine")
}
```

This package exposes a nice `rx` template tag. It's

- **tiny** — less than 450 bytes minified & gzipped, no dependencies
- **typed** — written in TypeScript, so our IDE can provide type hints 🎉
- **fun** — to the extent that regular expressions can be fun

## Installation

Install from npm:

```bash
npm install --save @loilo/rx
```

Or use in the browser via [unpkg](https://unpkg.com) (using the global `rx` variable):

```html
<script src="https://unpkg.com/@loilo/rx"></script>
```

## Usage

> _Disclaimer:_ Please keep in mind that all code examples in this readme are exclusively for demonstrational purposes. Most of them can be solved more efficiently and elegantly without any use of regular expressions.

### Flags

We can add flags to our regular expressions like this:

```js
function matchCaseInsensitive(string) {
  return rx.i`${string}`
}

const pattern = matchCaseInsensitive('foo') // pattern = /foo/i
pattern.test('foo') // true
pattern.test('fOO') // true
```

> **Note:** This way of adding flags will only work in modern environments (Node.js version 6 and up, evergreen browsers). If we need to support Internet Explorer etc., we may use `rx('i')` instead of `rx.i`.
>
> This is because an unpolyfillable technique called [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is used for the default way of adding flags.

### Raw Strings

From time to time, we may want to include control characters in some kind of conditional when `rx` inadvertently escapes them:

```js
function naiveNumberMatcher(allowFloat) {
  return rx`^-?[0-9]+${allowFloat ? '(\\.[0-9]+)?' : ''}$`
}

const pattern = naiveNumberMatcher(true)
// pattern = /^-?[0-9]+\(\\\.\[0\-9\]\+\)\?$/
// Snap! This won't match floating point numbers.
```

Luckily, there's an easy solution: just return the control characters as a regular expression:

```js
function naiveNumberMatcher(allowFloat) {
  return rx`^-?[0-9]+${allowFloat ? /(\.[0-9]+)?/ : ''}$`
}

const intPattern = naiveNumberMatcher(false) // intPattern = /^-?[0-9]+$/
intPattern.test('abc') // false
intPattern.test('0') // true
intPattern.test('-1') // true
intPattern.test('1.5') // false

const floatPattern = naiveNumberMatcher(true) // floatPattern = /^-?[0-9]+(\.[0-9]+)?$/
floatPattern.test('abc') // false
floatPattern.test('0') // true
floatPattern.test('-1') // true
floatPattern.test('1.5') // true
```

Alternatively, we could have wrapped the control characters in an `rx.raw()` call which will exclude them from being escaped:

```js
function naiveNumberMatcher(allowFloat) {
  return rx`^-?[0-9]+${allowFloat ? rx.raw('(\\.[0-9]+)?') : ''}$`

  // rx.raw also works as a template tag — note that we don't even have to double-escape the "." wildcard:
  return rx`^-?[0-9]+${allowFloat ? rx.raw`(\.[0-9]+)?')` : ''}$`
}
```

This can be necessary when the wrapped control characters are quantifiers which cannot form a regular expression of their own, e.g. `/?/`.

### Arrays

If an array is passed as a placeholder, its entries will be escaped and joined by a vertical bar — this way, we can easily express enumerations:

```js
function oneOf(...strings) {
  return rx('i')`^${strings}$`
}

const pattern = oneOf('a', 'b') // pattern = /^a|b$/i
pattern.test('a') // true
pattern.test('B') // true
pattern.test('d') // false
```

Note that arrays may also contain regular expressions or `rx.raw` strings which stay unescaped as [described above](#raw-strings):

```js
function oneOfTheseOrInteger(...strings) {
  return rx('i')`^(${[...strings, /[0-9]+/]})$`
}

const pattern = oneOfTheseOrInteger('a', 'b') // pattern = /^(a|b|[0-9]+)$/i
pattern.test('A') // true
pattern.test('d') // false
pattern.test('42') // true
```

Arrays can even be nested and are flattened automatically:

```js
const naivePluralize = value => value + 's'

function oneOrMultipleOf(...strings) {
  return rx`^${strings.map(string => [string, naivePluralize(string)])}$`
}

oneOrMultipleOf('cat', 'dog') // /^cat|cats|dog|dogs$/i
```

## Credit

In the world of programming, you're basically never the first person to come up with a clever trick. I [googled](https://www.google.com/search?q=regex+template+tag) my idea and it turned out that Lea Verou published [the very same thing](http://lea.verou.me/2018/06/easy-dynamic-regular-expressions-with-tagged-template-literals-and-proxies/) in 2018 — and this package is loosely based on her implementation.

Key differences are that I added type hints (therefore this package is written in TypeScript) and the aforementioned capability to merge in arrays and raw strings.
