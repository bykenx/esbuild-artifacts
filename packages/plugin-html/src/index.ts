import { Plugin } from 'esbuild'
import { HtmlPluginOptions } from './interface'
import path from 'path'
import fs from 'fs'
import { defaultTemplate } from './defaultTemplate'

const pluginName = 'plugin-html'

export const htmlPlugin = (options: HtmlPluginOptions = {}): Plugin => {
  return {
    name: pluginName,
    setup(build) {
      const { absWorkingDir, write, outbase, outdir } = build.initialOptions

      const baseDir = absWorkingDir || process.cwd()
      const outDir = options.outDir || path.join(baseDir, outbase || '', outdir || '')
      const inFile = options.templateFile
      const outFile = path.join(outDir, inFile ? path.basename(inFile) : 'index.html')

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
        const styles: string[] = []
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir)
        }
        if (result.outputFiles) {
          result.outputFiles.forEach(file => {
            fs.writeFileSync(file.path, file.contents)
            if (file.path.endsWith('.js')) {
              const p = path.relative(outDir, file.path)
              scripts.push(`<script src="${p}"></script>`)
            } else if (file.path.endsWith('.css')) {
              const p = path.relative(outDir, file.path)
              styles.push(`<link rel="stylesheet" href="${p}">`)
            }
          })
        }
        const content = (
          inFile
            ? fs.readFileSync(inFile, { encoding: 'utf-8' })
            : defaultTemplate
        )
          .replace(`<!--js-->`, scripts.join(`\n`))
          .replace(`<!--css-->`, styles.join(`\n`))
        fs.writeFileSync(outFile, content, { encoding: 'utf-8' })
      })
    }
  }
}
