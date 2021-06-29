import { SFCBlock } from '@vue/compiler-sfc'
import qs from 'querystring'
import { ICustomBlockQuery, IScriptBlockQuery, IStyleBlockQuery, ITemplateBlockQuery } from 'src/interface'

export type VueQuery =
  | IScriptBlockQuery
  | ITemplateBlockQuery
  | IStyleBlockQuery
  | ICustomBlockQuery

export function parseVuePartRequest(id: string): VueQuery {
  const [filename, query] = id.split('?', 2)
  const raw = qs.parse(query)
  return {
    ...raw,
    filename,
    index: Number(raw.index),
    src: 'src' in raw,
    scoped: 'scoped' in raw,
  } as any
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
