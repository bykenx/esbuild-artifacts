import { SFCAsyncStyleCompileOptions, SFCTemplateCompileOptions } from "@vue/compiler-sfc"

export interface IVuePluginOptions {
  target: 'node' | 'browser'
  exposeFilename: boolean

  customBlocks?: string[]

  // if true, handle preprocessors directly instead of delegating to other
  // rollup plugins
  preprocessStyles?: boolean

  // sfc template options
  templatePreprocessOptions?: Record<
    string,
    SFCTemplateCompileOptions['preprocessOptions']
  >
  compiler?: SFCTemplateCompileOptions['compiler']
  compilerOptions?: SFCTemplateCompileOptions['compilerOptions']
  transformAssetUrls?: SFCTemplateCompileOptions['transformAssetUrls']

  // sfc style options
  postcssOptions?: SFCAsyncStyleCompileOptions['postcssOptions']
  postcssPlugins?: SFCAsyncStyleCompileOptions['postcssPlugins']
  cssModulesOptions?: SFCAsyncStyleCompileOptions['modulesOptions']
  preprocessCustomRequire?: SFCAsyncStyleCompileOptions['preprocessCustomRequire']
  preprocessOptions?: SFCAsyncStyleCompileOptions['preprocessOptions']
}

export interface IScriptBlockQuery {
  filename: string
  type: 'script'
  src?: true
}

export interface ITemplateBlockQuery {
  filename: string
  type: 'template'
  id: string
  src?: true
}

export interface IStyleBlockQuery {
  filename: string
  type: 'style'
  index: number
  id: string
  scoped?: boolean
  module?: string | boolean
  src?: true
}

export interface ICustomBlockQuery {
  filename: string
  type: 'custom'
  index: number
  src?: true
}
