import chalk from 'chalk'
import { Plugin } from 'esbuild'
import { createProxies } from './createProxies'
import { createDevServer, startDevServer } from './devServer'
import { IDevServerOptions } from "./interface"

export function devServerPlugin(options: IDevServerOptions): Plugin {
  return {
    name: 'plugin-dev-server',
    setup(build) {
      // set build mode to increment mode.
      build.initialOptions.incremental = true
      // create dev server
      const app = createDevServer(build, options)
      // create proxies
      options.proxy && createProxies(app, options.proxy)
      startDevServer(app, options)
      build.onStart(() => {
        console.log(chalk.gray('plugin-dev-server: onStart'))
      })

      build.onEnd((result) => {
        console.log(chalk.gray('plugin-dev-server: onEnd'))
      })
    }
  }
}
