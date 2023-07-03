import formidable from "formidable";
import http, { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "http";
import https from "https";

interface UploadedFile {
  name: string;
  type: string;
  data: Buffer;
}

interface HoosatRequest extends IncomingMessage {
  parts: any[];
  url?: string | undefined;
  headers: http.IncomingHttpHeaders;
  params?: {};
  body?: any;
  files?: formidable.Files;
}

interface HoosatResponse extends ServerResponse {
  statusCode: number;
  headers: OutgoingHttpHeaders;
  send: (body: string | object) => HoosatResponse;
  json: (body: object) => HoosatResponse;
  status: (status: number) => HoosatResponse;
}

type HoosatRequestHandler = (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => void;

type HoosatServer = https.Server<typeof IncomingMessage, typeof ServerResponse> | http.Server<typeof IncomingMessage, typeof ServerResponse> | undefined;
type HoosatRoute = { path: string; handler: HoosatRequestHandler, method: string };

type HoosatRouter = {
  routes: HoosatRoute[];
  Route: (method: string, path: string, handler: HoosatRequestHandler) => void;
  UseRouter: (newRouter: HoosatRouter) => void;
  Get: (path: string, handler: HoosatRequestHandler) => void;
  Put: (path: string, handler: HoosatRequestHandler) => void;
  Post: (path: string, handler: HoosatRequestHandler) => void;
  Delete: (path: string, handler: HoosatRequestHandler) => void;
  Middleware: (handler: HoosatRequestHandler) => void;
};

interface HoosatServerOptions {
  protocol?: string,
  https?: {
    key?: string,
    cert?: string,
    ca?: string,
  }
}

export { HoosatServer, HoosatServerOptions, HoosatRequestHandler, HoosatRequest, HoosatResponse, HoosatRoute, HoosatRouter };

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

export interface HeadTags {
  title?: any;
  style?: any;
  meta?: any;
  link?: string;
  script?: any;
  base?: any;
}