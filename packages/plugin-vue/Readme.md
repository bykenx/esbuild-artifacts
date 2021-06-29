# esbuild-plugin-vue-sfc

## Description
vue plugin for esbuild, modified from [rollup-plugin-vue](https://github.com/vuejs/rollup-plugin-vue)

## Usage
```js
import { vuePlugin } from 'esbuild-plugin-vue-sfc'
import esbuild from 'esbuild'

esbuild.build({
  ...,
  plugins: [
    vuePlugin(),
  ],
  ...,
})
```
