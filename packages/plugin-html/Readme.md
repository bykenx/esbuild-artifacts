# esbuild-plugin-html-template

## Description
A simple esbuild plugin to generate html file.
> __notice only works when `write` is set to `false`__

## Usage
```js
import { htmlPlugin } from 'esbuild-plugin-html-template'
import esbuild from 'esbuild'

esbuild.build({
  ...,
  bundle: true,
  write: false,
  plugins: [
    htmlPlugin(),
  ],
  ...,
})
```
