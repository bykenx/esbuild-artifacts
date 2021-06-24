import { Plugin } from 'esbuild'
import { HtmlPluginOptions } from './interface'
import path from 'path'
import fs from 'fs'

const pluginName = 'plugin-html'

export const htmlPlugin = (options: HtmlPluginOptions = {}): Plugin => {
  return {
    name: pluginName,
    setup(build) {
      const { absWorkingDir, write, outbase, outdir } = build.initialOptions

      const baseDir = absWorkingDir || process.cwd()
      const outDir = options.outDir || path.join(baseDir, outbase || '', outdir || '')
      const insertAt = options.insertFlag || `<!--js-->`
      const inFile = options.templateFile || path.join(baseDir, 'index.html')
      const outFile = path.join(outDir, path.basename(inFile))

      console.log('plugin-html ready: ', options)
      build.onStart(() => {
        if (write !== false) {
          return {
            warnings: [
              { pluginName, text: `${pluginName} will only work when \`write\` set to \`false\`.` }
            ]
          }
        }
      })
      build.onEnd(result => {
        const scripts: string[] = []
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir)
        }
        if (result.outputFiles) {
          result.outputFiles.forEach(file => {
            fs.writeFileSync(file.path, file.contents)
            if (file.path.endsWith('.js')) {
              const p = path.relative(outDir, file.path)
              scripts.push(`<script src="${p}"></script>`)
            }
          })
        }
        const content = fs.readFileSync(inFile, { encoding: 'utf-8' })
        content.replace(insertAt, scripts.join(`\n`))
        fs.writeFileSync(outFile, content.replace(insertAt, scripts.join(`\n`)), { encoding: 'utf-8' })
      })
    }
  }
}
