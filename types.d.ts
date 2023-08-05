import formidable from "formidable";
import http, { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "http";
import https from "https";

/**
 * Represents an uploaded file.
 */
export interface UploadedFile {
  name: string;
  type: string;
  data: Buffer;
}

/**
 * Represents the data structure for analytics information.
 */
export interface AnalyticsDTO {
  key?: string;
  element?: string;
  event?: string;
  method?: string;
  type?: string;
  url: string;
  refererr: string;
  userAgent: string;
  width: number;
  height: number;
  ip: string;
  createdAt?: Date;
}

/**
 * Represents the HoosatRequest params
 */
export interface HoosatParams {
  [paramName: string]: string 
}


/**
 * Represents the extended request object for Hoosat.
 */
export interface HoosatRequest extends IncomingMessage {
  analytics?: AnalyticsDTO;
  parts: any[];
  url?: string | undefined;
  headers: http.IncomingHttpHeaders;
  params?: HoosatParams;
  body?: any;
  files?: formidable.Files;
}

/**
 * Represents the extended response object for Hoosat.
 */
export interface HoosatResponse extends ServerResponse {
  statusCode: number;
  headers: OutgoingHttpHeaders;
  send: (body: string | object) => HoosatResponse;
  json: (body: object) => HoosatResponse;
  status: (status: number) => HoosatResponse;
}

/**
 * Represents a request handler function for Hoosat.
 */
export type HoosatRequestHandler = (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => void;

/**
 * Represents the Hoosat server which could be either an https.Server or http.Server.
 */
export type HoosatServer = https.Server<typeof IncomingMessage, typeof ServerResponse> | http.Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

/**
 * Represents a Hoosat route with path, handler, and method.
 */
export type HoosatRoute = { path: string; handler: HoosatRequestHandler, method: string };

/**
 * Represents the Hoosat router with various route handling methods.
 */
export type HoosatRouter = {
  routes: HoosatRoute[];
  Route: (method: string, path: string, handler: HoosatRequestHandler) => void;
  UseRouter: (newRouter: HoosatRouter) => void;
  Get: (path: string, handler: HoosatRequestHandler) => void;
  Put: (path: string, handler: HoosatRequestHandler) => void;
  Post: (path: string, handler: HoosatRequestHandler) => void;
  Delete: (path: string, handler: HoosatRequestHandler) => void;
  Middleware: (handler: HoosatRequestHandler) => void;
};

/**
 * Represents the options for the Hoosat server.
 */
export interface HoosatServerOptions {
  protocol?: string,
  https?: {
    key?: string,
    cert?: string,
    ca?: string,
  }
}

/**
 * Represents the context for HelmetProvider in React.
 */
export interface HelmetContext {
  helmet?: {
    priority?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    base?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    bodyAttributes?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    htmlAttributes?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    link?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    meta?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    noscript?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    script?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    style?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
    title?: {
      toComponent: () => React.ReactElement | null;
      toString: () => string;
    };
  }
}

/**
 * Represents the tags for the head of the HTML document.
 */
export interface HeadTags {
  title?: any;
  style?: any;
  meta?: any;
  link?: string;
  script?: any;
  base?: any;
}