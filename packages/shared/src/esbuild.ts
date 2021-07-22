import { PluginBuild } from 'esbuild'
import path from 'path'
import fs from 'fs'

export function resolveEsbuildWorkingDir(build: PluginBuild) {
  return build.initialOptions.absWorkingDir || process.cwd()
}

export function resolveEsbuildOutDir(build: PluginBuild) {
  return path.join(resolveEsbuildWorkingDir(build), build.initialOptions.outbase || '', build.initialOptions.outdir || '')
}

export function loadEsbuildProjectPackageJson(build: PluginBuild) {
  const packageFilePath = path.resolve(resolveEsbuildWorkingDir(build), 'package.json')
  return JSON.parse(fs.readFileSync(packageFilePath, 'utf-8'))
}

export function resolveEsbuildProjectName(build: PluginBuild) {
  const content = loadEsbuildProjectPackageJson(build)
  return content.name
}
