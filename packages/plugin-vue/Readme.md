# @byken/esbuild-plugin-vue 

## Description
vue plugin for esbuild, modified from [rollup-plugin-vue](https://github.com/vuejs/rollup-plugin-vue)

## Usage
```js
import { vuePlugin } from '@byken/esbuild-plugin-vue'
import esbuild from 'esbuild'

esbuild.build({
  ...,
  plugins: [
    vuePlugin(),
  ],
  ...,
})
```