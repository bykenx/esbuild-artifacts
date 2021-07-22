import { PluginBuild } from "esbuild"
import express, { Express } from 'express'
import { IDevServerOptions } from "./interface"

export function createDevServer(build: PluginBuild, options: IDevServerOptions) {
  const app = express()
  return app
}

export function startDevServer(app: Express, options: IDevServerOptions) {
  return app
}
