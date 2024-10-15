/**
 * Hoosat Server-side Renderer
 *
 * This module provides a server-side rendering (SSR) function for rendering React JSX elements or ReactNodes
 * to a pipeable stream and sending the response to the client.
 */
import fs from 'fs';
import { renderToPipeableStream, renderToString  } from "react-dom/server";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { replaceHeadTags } from "./seo";
import { HeadTags, HoosatResponse } from "./types";
import { ErrorHandler } from "./errors";
import { ReactElement, JSXElementConstructor } from "react";
import internal from "stream";
import React from 'react';
import { readNonceFromFile } from './nonce';
import { generateSitemap } from './sitemap';


/**
 * Represents the arguments for the Hoosat server-side renderer.
 *
 * @typedef {Object} HoosatRendererParams
 * @property {HoosatResponse} res - The server response object.
 * @property {ReactNode | JSX.Element} jsx - The JSX element or ReactNode to be rendered.
 * @property {object} [helmetContext] - The context object for helmet's <HelmetProvider>.
 * @property {boolean} [extractCSS] - Flag to indicate if CSS should be extracted from the React application.
 * @property {string} [preloadTagFolder] - The folder path for preloading tags in production mode.
 * @property {HeadTags} [headTags] - The additional head tags to be included in the rendered HTML.
 */
export interface HoosatRendererParams {
  res: HoosatResponse,
  jsx: ReactElement<any, string | JSXElementConstructor<any>>,
  publicDir: string,
  headTags?: HeadTags,
}

/**
 * Generates a transform stream to replace head tags using the helmet context.
 *
 * @param {HeadTags} headTags - The head tags to be replaced.
 * @param {object} helmetContext - The context object for helmet's <HelmetProvider>.
 * @returns {Promise<internal.Transform>} The transform stream to replace head tags.
 */
export const helmetStream = async (headTags: HeadTags, helmetContext: any): Promise<internal.Transform> => {
  if (helmetContext === undefined) {
    return replaceHeadTags({
      title: headTags.title,
      meta: headTags.meta,
      link: headTags.link,
      script: headTags.script,
      base: headTags.base,
      style: headTags.style,
    });
  }
  const { helmet } = helmetContext;
  
  const replaceStream = replaceHeadTags({
    title: headTags.title + helmet?.title?.toString(),
    meta: headTags.meta + helmet?.meta?.toString(),
    link: headTags.link + (helmet?.link?.toString()),
    script: headTags.script + helmet?.script?.toString(),
    base: headTags.base + helmet?.base?.toString(),
    style: headTags.style + helmet?.style?.toString(),
  });
  return replaceStream;
}


const as: { [key: string]: string } = {
  'ico': 'image',
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'avif': 'image',
  'svg': 'image',
  'otf': 'font',
  'ttf': 'font',
  'pdf': 'document',
  'txt': 'document',
  'csv': 'document',
  'json': 'fetch',
  'xml': 'document',
  'html': 'document',
  'xhtml': 'document',
  'js': 'script',
  'css': 'sstyle',
  'mp4': 'audio',
  'mp3': 'audo',
  'wav': 'audio',
  'doc': 'document',
  'xls': 'document',
  'pptx': 'document',
  'docx': 'document',
  'ppt': 'document',
  'zip': 'fetch', 
  'rar': 'fetch',
  'webm': 'video',
  'mkv': 'video',
  'avi': 'video',
  '': "document",
};


const getFileType = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Renders a React JSX element or ReactNode to a pipeable stream and sends the response to the client.
 * This function is designed for server-side rendering (SSR) in a Hoosat application.
 *
 * @param {HoosatRenderer} params - The arguments for Hoosat server-side renderer.
 * @returns {void}
 */
export const renderer = async ({ res, jsx, publicDir, headTags }: HoosatRendererParams): Promise<void> => {
  const helmetContext = {};
  const bundleFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('bundle.') && file.endsWith('.js'));
  const vendorFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('vendor.') && file.endsWith('.js'));

  const root = <React.StrictMode>
                  <HelmetProvider context={helmetContext}>
                      {jsx}
                  </HelmetProvider>
              </React.StrictMode>;
  const stringRender = renderToString(root);
  const prefetchRegex = /(?:src|href)\s*=\s*['"](?!(http:\/\/|https:\/\/|#))([^'"\s@]*\.[^'"\s@]*)['"]/g;
  let match;
  const prefetchUrlsFromRender = [];
  while ((match = prefetchRegex.exec(stringRender)) !== null) {
    if (!match[2].includes("manifest.json")) {
      prefetchUrlsFromRender.push(match[2]);
    }
  }
  const sitemapUrlRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
  const sitemapUrlsFromRender = [];
  while ((match = sitemapUrlRegex.exec(stringRender)) !== null) {
    sitemapUrlsFromRender.push(match[2]);
  }
  generateSitemap(publicDir, sitemapUrlsFromRender);
  const nonce = readNonceFromFile();
  console.log(nonce);
  const preloadsFromRender = prefetchUrlsFromRender.map((url) => (`<link rel="prefetch" href="${url}" nonce="${nonce}" crossorigin />`));
  const preloadsFromBundleFiles = bundleFiles.map((preload) => (`<link rel="preload" href="/${preload}" as="${as[getFileType(preload)]}" nonce="${nonce}" crossorigin />`)) || [""];
  const preloadsFromVendorFiles = vendorFiles.map((preload) => (`<link rel="preload" href="/${preload}" as="${as[getFileType(preload)]}" nonce="${nonce}" crossorigin />`)) || [""];
  const preloads = [...preloadsFromBundleFiles, ...preloadsFromVendorFiles, ...preloadsFromRender ];
  const scriptsFromBundleFiles = bundleFiles.map((script) => (`<script type="module" src="/${script}" async></script>`) || [""]);
  const scriptsFromVendorFiles = bundleFiles.map((script) => (`<script type="module" src="/${script}" async></script>`) || [""]);
  const scripts = [...scriptsFromBundleFiles, ...scriptsFromVendorFiles];
  const stream = renderToPipeableStream(
    root,
    {
      // bootstrapModules: [...bundleFiles, ...vendorFiles],
      onShellReady: async () => {
        res.setHeader('content-type', 'text/html');
        if (helmetContext !== undefined) {
          let newTags: HeadTags = {};
          if (headTags !== undefined) {
            newTags = headTags;
          }
          newTags.link = newTags.link + preloads.join("\n") + `<link rel="preload" href="/public/styles.css" as="style" nonce="${nonce}" crossorigin /><link rel="stylesheet" href="/public/styles.css" crossorigin />\n`;
          newTags.script = newTags.script + scripts.join("\n");
          const replaceStream = await helmetStream(newTags, helmetContext);
          stream.pipe(replaceStream).pipe(res);
        } else {
          stream.pipe(res);
        }
      },
      onShellError(error) {
        console.error(error);
        res.status(500).send("onShellError");
        ErrorHandler(error);
      },
      onError(error) {
        console.error(error);
        ErrorHandler(error);
      }
    }
  );
};
