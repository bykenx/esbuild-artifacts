import {
  compileStyleAsync,
  SFCAsyncStyleCompileOptions,
} from '@vue/compiler-sfc'
import { IVuePluginOptions } from './interface'
import { getDescriptor } from './utils/descriptorCache'
import { StyleBlockQuery } from './utils/query'

export async function transformStyle(
  code: string,
  options: IVuePluginOptions,
  query: StyleBlockQuery,
  isProduction: boolean
) {
  const descriptor = getDescriptor(query.filename)
  const block = descriptor.styles[query.index]!

  let preprocessOptions = options.preprocessOptions || {}
  const preprocessLang = (options.preprocessStyles
    ? block.lang
    : undefined) as SFCAsyncStyleCompileOptions['preprocessLang']

  if (preprocessLang) {
    preprocessOptions = preprocessOptions[preprocessLang] || preprocessOptions
    // include node_modules for imports by default
    switch (preprocessLang) {
      case 'scss':
      case 'sass':
        preprocessOptions = {
          includePaths: ['node_modules'],
          ...preprocessOptions,
        }
        break
      case 'less':
      case 'stylus':
        preprocessOptions = {
          paths: ['node_modules'],
          ...preprocessOptions,
        }
    }
  } else {
    preprocessOptions = {}
  }

  const result = await compileStyleAsync({
    filename: query.filename,
    id: `data-v-${query.id}`,
    isProd: isProduction,
    source: code,
    scoped: block.scoped,
    modules: !!block.module,
    postcssOptions: options.postcssOptions,
    postcssPlugins: options.postcssPlugins,
    modulesOptions: options.cssModulesOptions,
    preprocessLang,
    preprocessCustomRequire: options.preprocessCustomRequire,
    preprocessOptions,
  })

  if (result.errors.length) {
    // TODO: 添加错误处理
    return null
  }

  if (query.module) {
    return `export default ${JSON.stringify(result.modules)}`
  } else {
    return result.code
  }
}
