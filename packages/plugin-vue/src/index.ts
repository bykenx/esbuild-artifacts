import { OnLoadResult, PluginBuild } from 'esbuild'
import fs from 'fs'
import { resolve } from 'path'
import { IVuePluginOptions } from './interface'
import { getResolvedScript } from './script'
import { transformSFCEntry } from './sfc'
import { transformStyle } from './style'
import { transformTemplate } from './template'
import { createCustomBlockFilter } from './utils/customBlockFilter'
import { getDescriptor, setDescriptor } from './utils/descriptorCache'
import { parseVuePartRequest } from './utils/query'

const defaultOptions: IVuePluginOptions = {
  target: 'browser',
  exposeFilename: false,
  customBlocks: [],
}

export const vuePlugin = (userOptions: Partial<IVuePluginOptions> = {}) => ({
  name: 'plugin-vue',
  setup(build: PluginBuild) {

    const options: IVuePluginOptions = {
      ...defaultOptions,
      ...userOptions,
    }

    const isServer = options.target === 'node'
    const isProduction = process.env.NODE_ENV === 'production'
    const rootContext = process.cwd()
    const filterCustomBlock = createCustomBlockFilter(options.customBlocks)

    build.onResolve({ filter: /[^/]+\.vue\?([^/]+)$/ }, (args) => {
      const query = parseVuePartRequest(args.path)

      if (query.src) {
        const path = resolve(args.resolveDir, query.filename)
        if (fs.existsSync(path)) {
          setDescriptor(path, getDescriptor(args.importer))
          const [, originalQuery] = args.path.split('?', 2)
          return {
            path: [path, originalQuery].join('')
          }
        }
      } else {
        return {
          path: resolve(args.resolveDir, args.path)
        }
      }
    })

    // SFC（.vue）
    build.onLoad({ filter: /[^/]+\.vue$/ }, (args) => {
      const code = fs.readFileSync(args.path, 'utf-8')
      const contents = transformSFCEntry(
        code,
        args.path,
        options,
        rootContext,
        isProduction,
        isServer,
        filterCustomBlock
      )
      return { contents }
    })

    build.onLoad({ filter: /[^/]+\.vue\?([^/]+)$/ }, async (args) => {
      const query = parseVuePartRequest(args.path)
      const result: OnLoadResult = {}
      if (query.src) {
        result.watchFiles = [query.filename]
        result.contents = fs.readFileSync(query.filename, 'utf-8')
      } else {
        const descriptor = getDescriptor(query.filename)
        if (descriptor) {
          switch (query.type) {
            case 'template':
              result.contents = transformTemplate(descriptor.template!.content, options, query)
              break
            case 'script':
              result.contents = getResolvedScript(descriptor, isServer)?.content
              break
            case 'style':
              result.contents = await transformStyle(descriptor.styles[query.index].content, options, query, isProduction)
              result.loader = 'css'
              break
            case 'custom':
              result.contents = descriptor.customBlocks[query.index].content
              break
            default:
              break
          }
        }
      }
      return result
    })
  }
})
