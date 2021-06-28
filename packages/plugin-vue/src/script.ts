import { compileScript, SFCDescriptor, SFCScriptBlock } from "@vue/compiler-sfc"
import { IVuePluginOptions } from "./interface"
import { getTemplateCompilerOptions } from "./template"

const clientCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()
const serverCache = new WeakMap<SFCDescriptor, SFCScriptBlock | null>()

export function getResolvedScript(
  descriptor: SFCDescriptor,
  isServer: boolean
): SFCScriptBlock | null | undefined {
  return (isServer ? serverCache : clientCache).get(descriptor)
}

export function resolveScript(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProduction: boolean,
  isServer: boolean,
  options: IVuePluginOptions
) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return null
  }

  const cacheToUse = isServer ? serverCache : clientCache
  const cached = cacheToUse.get(descriptor)

  if (cached) {
    return cached
  }

  let resolved: SFCScriptBlock | null = null

  try {
    resolved = compileScript(descriptor, {
      id: scopeId,
      isProd: isProduction,
      inlineTemplate: true,
      templateOptions: getTemplateCompilerOptions(
        options,
        descriptor,
        scopeId
      )
    })
  } catch (err) {
    // TODO: 添加错误处理
  }

  cacheToUse.set(descriptor, resolved)
  return resolved
}
