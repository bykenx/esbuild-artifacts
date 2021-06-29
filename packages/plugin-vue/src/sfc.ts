import { parse, SFCDescriptor } from '@vue/compiler-sfc'
import hash from 'hash-sum'
import path from 'path'
import { IVuePluginOptions } from './interface'
import { resolveScript } from './script'
import { setDescriptor } from './utils/descriptorCache'
import { attrsToQuery } from './utils/query'
import slash from './utils/slash'

export function transformSFCEntry(
  code: string,
  filename: string,
  options: IVuePluginOptions,
  sourceRoot: string,
  isProduction: boolean,
  isServer: boolean,
  filterCustomBlock: (type: string) => boolean,
) {
  const { descriptor, errors } = parse(code, { sourceMap: false, filename, sourceRoot })
  setDescriptor(filename, descriptor)

  if (errors.length > 0) {
    // TODO: 添加错误处理代码
    return ''
  }

  const shortFilePath = slash(path.resolve(sourceRoot, filename))

  // scoped style
  const scopeId = hash(isProduction ? shortFilePath + '\n' + code : shortFilePath)
  const hasScoped = descriptor.styles.some(s => s.scoped)

  const isTemplateInlined = descriptor.scriptSetup && !descriptor.template?.src
  const hasTemplateImport = descriptor.template && !isTemplateInlined

  const output = []

  // <template src />
  hasTemplateImport && output.push(genTemplateCode(descriptor, scopeId, isServer))
  // <script> or <script setup>
  output.push(genScriptCode(descriptor, scopeId, isProduction, isServer, options))
  // <style> or <style scoped />, etc.
  output.push(genStyleCode(descriptor, scopeId, options.preprocessStyles))
  // <block-name>
  output.push(genCustomBlock(descriptor, filterCustomBlock))

  hasTemplateImport && isServer && output.push(`script.ssrRender = ssrRender`)
  hasTemplateImport && !isServer && output.push(`script.render = render`)
  hasScoped && output.push(`script.__scopeId = ${JSON.stringify(`data-v-${scopeId}`)}`)

  if (!isProduction) {
    output.push(`script.__file = ${JSON.stringify(shortFilePath)}`)
  } else if (options.exposeFilename) {
    output.push(`script.__file = ${JSON.stringify(path.basename(shortFilePath))}`)
  }
  // end
  output.push(`export default script`)

  return output.join(`\n`)
}

// generate code from `template` block
function genTemplateCode(
  descriptor: SFCDescriptor,
  id: string,
  isServer: boolean,
) {
  const renderFnName = isServer ? 'ssrRender' : 'render'
  let templateImport = `const ${renderFnName} = () => {}`
  let templateRequest
  if (descriptor.template) {
    const src = descriptor.template.src || descriptor.filename
    const idQuery = `&id=${id}`
    const srcQuery = descriptor.template.src ? `&src` : ``
    const attrsQuery = attrsToQuery(descriptor.template.attrs, 'js', true)
    const query = `?vue&type=template${idQuery}${srcQuery}${attrsQuery}`
    templateRequest = JSON.stringify(src + query)
    templateImport = `import { ${renderFnName} } from ${templateRequest}`
  }

  return templateImport
}

// generate code from `script` block
function genScriptCode(
  descriptor: SFCDescriptor,
  scopeId: string,
  isProduction: boolean,
  isServer: boolean,
  options: IVuePluginOptions
) {
  let scriptImport = `const script = {}`
  const script = resolveScript(descriptor, scopeId, isProduction, isServer, options)
  if (script) {
    const src = script.src || descriptor.filename
    const attrsQuery = attrsToQuery(script.attrs, 'js')
    const srcQuery = script.src ? `&src` : ``
    const query = `?vue&type=script${srcQuery}${attrsQuery}`
    const scriptRequest = JSON.stringify(src + query)
    scriptImport = ``
      + `import script from ${scriptRequest}`
      + `\n`
      + `export * from ${scriptRequest}`
  }
  return scriptImport
}

function genStyleCode(
  descriptor: SFCDescriptor,
  scopeId: string,
  preprocessStyles?: boolean,
) {
  let stylesCode = ``
  let hasCSSModules = false
  if (descriptor.styles.length > 0) {
    descriptor.styles.forEach((style, i) => {
      const src = style.src || descriptor.filename
      const attrsQuery = attrsToQuery(style.attrs, 'css', preprocessStyles)
      const attrsQueryWithoutModule = attrsQuery.replace(/&module(=true|=[^&]+)?/, '')
      const idQuery = `&id=${scopeId}`
      const srcQuery = style.src ? `&src` : ``
      const query = `?vue&type=style&index=${i}${srcQuery}${idQuery}`
      const styleRequest = src + query + attrsQuery
      const styleRequestWithoutModule = src + query + attrsQueryWithoutModule

      if (style.module) {
        if (!hasCSSModules) {
          stylesCode += `\nconst cssModules = script.__cssModules = {}`
          hasCSSModules = true
        }
        stylesCode += genCSSModulesCode(i, styleRequest, styleRequestWithoutModule, style.module)
      } else {
        stylesCode += `\nimport ${JSON.stringify(styleRequest)}`
      }
    })
  }
  return stylesCode
}

function genCustomBlock(
  descriptor: SFCDescriptor,
  filter: (type: string) => boolean
) {
  let code = ''

  descriptor.customBlocks.forEach((block, index) => {
    if (filter(block.type)) {
      const src = block.src || descriptor.filename
      const attrsQuery = attrsToQuery(block.attrs, block.type)
      const srcQuery = block.src ? `&src` : ``
      const query = `?vue&type=${block.type}&index=${index}${srcQuery}${attrsQuery}`
      const request = JSON.stringify(src + query)
      code += `import block${index} from ${request}\n`
      code += `if (typeof block${index} === 'function') block${index}(script)\n`
    }
  })
  return code
}

function genCSSModulesCode(
  index: number,
  request: string,
  requestWithoutModule: string,
  moduleName: string | boolean,
): string {
  const styleVar = `style${index}`
  let code = '\n'
    + `import ${JSON.stringify(requestWithoutModule)}`
    + `\n`
    + `import ${styleVar} from ${JSON.stringify(request + '.js')}`

  const name = typeof moduleName === 'string' ? moduleName : '$style'
  code += `\ncssModules["${name}"] = ${styleVar}`
  return code
}
