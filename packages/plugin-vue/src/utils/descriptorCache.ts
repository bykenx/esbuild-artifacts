// copy from https://github.com/vuejs/rollup-plugin-vue/blob/next/src/utils/descriptorCache.ts

import { SFCDescriptor } from '@vue/compiler-sfc'

const cache = new Map<string, SFCDescriptor>()

export function setDescriptor(id: string, entry: SFCDescriptor) {
  cache.set(id, entry)
}

export function getDescriptor(id: string) {
  if (cache.has(id)) {
    return cache.get(id)!
  }

  throw new Error(`${id} is not parsed yet`)
}
