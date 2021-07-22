import { Express } from "express"
import { ProxyOptions } from "./interface"
import proxy from 'express-http-proxy'

export function createProxies(app: Express, options: ProxyOptions) {
  Object.entries(options)
    .forEach(([key, value]) => {
      let host, options
      if (typeof value === 'string' || typeof value === 'function') {
        host = value
      } else {
        host = value.host,
          options = value.options
      }
      app.use(key, proxy(host, options))
    })
  return app
}
