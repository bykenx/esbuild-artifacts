import {
  compileTemplate,
  SFCDescriptor,
  SFCTemplateCompileOptions,
} from '@vue/compiler-sfc'
import { IVuePluginOptions } from './interface'
import { getResolvedScript } from './script'
import { getDescriptor } from './utils/descriptorCache'
import { TemplateBlockQuery } from './utils/query'

export function transformTemplate(
  code: string,
  options: IVuePluginOptions,
  query: TemplateBlockQuery
) {
  const descriptor = getDescriptor(query.filename)
  const result = compileTemplate({
    ...getTemplateCompilerOptions(options, descriptor, query.id),
    id: query.id,
    source: code,
    filename: query.filename,
  })

  if (result.errors.length) {
    // TODO: 添加错误处理
    return null
  }

  if (result.tips.length) {
    // TODO: 添加警告处理
  }

  return result.code
}

export function getTemplateCompilerOptions(
  options: IVuePluginOptions,
  descriptor: SFCDescriptor,
  scopeId: string
): Omit<SFCTemplateCompileOptions, 'source'> | undefined {
  const block = descriptor.template
  if (!block) {
    return
  }

  const isProd =
    process.env.NODE_ENV === 'production' || process.env.BUILD === 'production'
  const isServer = options.target === 'node'
  const hasScoped = descriptor.styles.some((s) => s.scoped)
  const preprocessLang = block.lang
  const preprocessOptions =
    preprocessLang &&
    options.templatePreprocessOptions &&
    options.templatePreprocessOptions[preprocessLang]
  const resolvedScript = getResolvedScript(descriptor, isServer)
  return {
    id: scopeId,
    scoped: hasScoped,
    isProd,
    filename: descriptor.filename,
    inMap: block.src ? undefined : block.map,
    preprocessLang,
    preprocessOptions,
    preprocessCustomRequire: options.preprocessCustomRequire,
    compiler: options.compiler,
    ssr: isServer,
    ssrCssVars: descriptor.cssVars,
    compilerOptions: {
      ...options.compilerOptions,
      scopeId: hasScoped ? `data-v-${scopeId}` : undefined,
      bindingMetadata: resolvedScript ? resolvedScript.bindings : undefined,
    },
    transformAssetUrls: options.transformAssetUrls,
  }
}
