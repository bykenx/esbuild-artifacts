// copy from https://github.com/vuejs/rollup-plugin-vue/blob/next/src/utils/query.ts

import { SFCBlock } from '@vue/compiler-sfc'
import qs from 'querystring'

export interface ScriptBlockQuery {
  filename: string
  vue: true
  type: 'script'
  src?: true
}

export interface TemplateBlockQuery {
  filename: string
  vue: true
  type: 'template'
  id: string
  src?: true
}

export interface StyleBlockQuery {
  filename: string
  vue: true
  type: 'style'
  index: number
  id: string
  scoped?: boolean
  module?: string | boolean
  src?: true
}

export interface CustomBlockQuery {
  filename: string
  vue: true
  type: 'custom'
  index: number
  src?: true
}

export interface NonVueQuery {
  filename: string
  vue: false
}

export type Query =
  | NonVueQuery
  | ScriptBlockQuery
  | TemplateBlockQuery
  | StyleBlockQuery
  | CustomBlockQuery

export function parseVuePartRequest(id: string): Query {
  const [filename, query] = id.split('?', 2)

  if (!query) return { vue: false, filename }

  const raw = qs.parse(query)

  if ('vue' in raw) {
    return {
      ...raw,
      filename,
      vue: true,
      index: Number(raw.index),
      src: 'src' in raw,
      scoped: 'scoped' in raw,
    } as any
  }

  return { vue: false, filename }
}

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = ['id', 'index', 'src', 'type', 'lang']

export function attrsToQuery(
  attrs: SFCBlock['attrs'],
  langFallback?: string,
  forceLangFallback = false
): string {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}${value ? `=${qs.escape(String(value))}` : ``
        }`
    }
  }
  if (langFallback || attrs.lang) {
    query +=
      `lang` in attrs
        ? forceLangFallback
          ? `&lang.${langFallback}`
          : `&lang.${attrs.lang}`
        : `&lang.${langFallback}`
  }
  return query
}
