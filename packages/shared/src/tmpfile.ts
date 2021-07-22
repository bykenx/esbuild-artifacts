import { tmpdir } from 'os'
import { resolve } from 'path'

export function resolveSystemTempDir(name: string) {
  return resolve(tmpdir(), name)
}
