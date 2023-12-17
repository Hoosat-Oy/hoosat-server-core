/**
 * Hoosat Server-side Renderer
 *
 * This module provides a server-side rendering (SSR) function for rendering React JSX elements or ReactNodes
 * to a pipeable stream and sending the response to the client.
 */
import { renderToPipeableStream } from "react-dom/server";
import { FilledContext } from "react-helmet-async";
import { generatePreloadTags } from "./preload";
import { replaceHeadTags } from "./seo";
import { HeadTags, HoosatResponse } from "./types";
import { ErrorHandler } from "./errors";
import { ReactNode, JSX } from "react";
import internal from "stream";
import { extractCssFrom } from "./cssextractor";

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
  jsx: ReactNode | JSX.Element,
  helmetContext?: object,
  extractCSS?: boolean,
  preloadTagFolder?: string,
  headTags?: HeadTags,
}

/**
 * Generates a transform stream to replace head tags using the helmet context.
 *
 * @param {HeadTags} headTags - The head tags to be replaced.
 * @param {object} helmetContext - The context object for helmet's <HelmetProvider>.
 * @returns {Promise<internal.Transform>} The transform stream to replace head tags.
 */
export const helmetStream = async (headTags: HeadTags, helmetContext: object): Promise<internal.Transform> => {
  const { helmet } = helmetContext as FilledContext;
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

/**
 * Renders a React JSX element or ReactNode to a pipeable stream and sends the response to the client.
 * This function is designed for server-side rendering (SSR) in a Hoosat application.
 *
 * @param {HoosatRenderer} params - The arguments for Hoosat server-side renderer.
 * @returns {void}
 */
export const renderer = ({ res, jsx, helmetContext, extractCSS, preloadTagFolder, headTags }: HoosatRendererParams): void => {
  let css = "";
  if(extractCSS === true) {
    css = extractCssFrom("./src/client");
  }
  let preloadTags = generatePreloadTags(preloadTagFolder!, "/");
  const stream = renderToPipeableStream(
    jsx,
    {
      bootstrapModules: ["/bundle.js"],
      onShellReady: async () => {
        res.setHeader('content-type', 'text/html');
        if (helmetContext !== undefined) {
          let newTags: HeadTags = {};
          if (headTags !== undefined) {
            newTags = headTags;
          }
          newTags.link = newTags.link + preloadTags.join("\n") + '<link rel="stylesheet" href="combined-styles.css" />';
          if (extractCSS === true) {
            newTags.style = newTags.style + "<style>" + css + "</style>";
          }
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
