import { Loader, PluginBuild } from 'esbuild'
import fs from 'fs'
import path from 'path'
import { IVuePluginOptions } from './interface'
import { getResolvedScript } from './script'
import { transformSFCEntry } from './sfc'
import { transformStyle } from './style'
import { transformTemplate } from './template'
import { createCustomBlockFilter } from './utils/customBlockFilter'
import { getDescriptor, setDescriptor } from './utils/descriptorCache'
import { parseVuePartRequest } from './utils/query'

const pluginName = 'plugin-vue'
const filter = /[^/]+\.vue$/
const blockFilter = /[^/]+\.vue\?([^/]+)$/

const defaultOptions: IVuePluginOptions = {
  target: 'browser',
  exposeFilename: false,
  customBlocks: [],
}

export const vuePlugin = (userOptions: Partial<IVuePluginOptions> = {}) => ({
  name: pluginName,
  setup(build: PluginBuild) {

    const options: IVuePluginOptions = {
      ...defaultOptions,
      ...userOptions,
    }

    const isServer = options.target === 'node'
    const isProduction = process.env.NODE_ENV === 'production'
    const rootContext = process.cwd()

    const filterCustomBlock = createCustomBlockFilter(options.customBlocks)

    // 解析 Sample.vue?vue&src=xxxx
    build.onResolve({ filter: blockFilter }, (args) => {
      const query = parseVuePartRequest(args.path)

      if (query.vue) {
        if (query.src) {
          const p = path.resolve(args.resolveDir, query.filename)
          if (fs.existsSync(p)) {
            setDescriptor(p, getDescriptor(args.importer))
            const [, originalQuery] = args.path.split('?', 2)
            return {
              path: [p, originalQuery].join('')
            }
          }
        } else {
          return {
            path: path.resolve(args.resolveDir, args.path)
          }
        }
      }
      return null
    })

    // sfc
    build.onLoad({ filter }, (args) => {
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

      return {
        contents,
      }
    })

    build.onLoad({ filter: blockFilter }, async (args) => {

      const query = parseVuePartRequest(args.path)

      if (query.vue) {
        const watchFiles = []
        if (build.initialOptions.watch) {
          watchFiles.push(query.filename)
        }
        if (query.src) {
          return {
            contents: fs.readFileSync(query.filename, 'utf-8'),
            watchFiles
          }
        }
        console.log('args: ', args)
        const descriptor = getDescriptor(query.filename)
        let loader: Loader = 'default'
        if (descriptor) {
          let contents
          switch (query.type) {
            case 'template':
              contents = transformTemplate(descriptor.template!.content, options, query)
              break
            case 'script':
              contents = getResolvedScript(descriptor, isServer)?.content
              break
            case 'style':
              contents = await transformStyle(descriptor.styles[query.index].content, options, query, isProduction)
              loader = 'css'
              break
            case 'custom':
              contents = descriptor.customBlocks[query.index].content
              break
            default:
              break
          }
          if (contents) {
            return { contents, loader }
          }
        }
      }

      return { contents: '' }
    })
  }
})
