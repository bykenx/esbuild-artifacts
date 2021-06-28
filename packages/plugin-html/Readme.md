# @byken/esbuild-plugin-html

## Description
A simple esbuild plugin to generate html file.
> __notice only works when `write` is set to `false`__

## Usage
```js
import { htmlPlugin } from '@byken/esbuild-plugin-html'
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