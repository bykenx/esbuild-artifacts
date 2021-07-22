import http from 'http'
import ws from 'ws'
import { Request } from 'express'
import proxy from 'express-http-proxy'

export type ProxyOptions = Record<string, string | ((req: Request) => string) | { host: string | ((req: Request) => string), options: proxy.ProxyOptions }>

export interface IDevServerOptions {
  /**
   * listen host.
   * default `127.0.0.1`
   */
  host?: string;
  /**
   * listen port.
   * default `3000`
   */
  prot?: number;
  /**
   *  https instead of http.
   *  default `false`
   */
  https?: boolean;

  /**
   * proxy settings
   *
   * @example
   *
   * {
   *   '/api': (path) => `${serverUrl}${prefix}${path}`
   * }
   */
  proxy?: ProxyOptions;
}

export interface IDevServer {
  options: IDevServerOptions;
  httpServer: http.Server,
  websocketServer: ws.Server,
  listen(port?: number): Promise<IDevServer>;
  close(): Promise<void>;
}
