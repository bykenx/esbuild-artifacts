import { resolveEsbuildProjectName, resolveSystemTempDir } from "byken-esbuild-plugin-shared"
import { PluginBuild } from "esbuild"

export function initOptions(build: PluginBuild) {
  const name = resolveEsbuildProjectName(build) || 'test'
  const tempDir = resolveSystemTempDir(name)
  build.initialOptions.outdir = tempDir
  return build
}
