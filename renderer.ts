import { renderToPipeableStream } from "react-dom/server";
import { FilledContext } from "react-helmet-async";
import { extractCssFrom } from "./cssExtractor";
import { generatePreloadTags } from "./preload";
import { replaceHeadTags } from "./seo";
import { HeadTags, HoosatResponse } from "./types";
import { ErrorHandler } from "./errors";
import { ReactNode, JSX } from "react";
import internal from "stream";


interface HoosatRenderer {
  res: HoosatResponse,
  jsx: ReactNode | JSX.Element,
  helmetContext?: object,
  extractCSS?: boolean,
  preloadTagFolder?: string,
  headTags?: HeadTags,
}


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
 * @param {HoosatRenderer} params - The arguments for Hoosat server side renderer.
 * @returns {void}
 */
export const renderer = (params: HoosatRenderer): void => {
  const { res, jsx, helmetContext, extractCSS, preloadTagFolder, headTags } = params;
  let css = "";
  if(extractCSS == true) {
    css = extractCssFrom("./src/client");
  }
  let preloadTags: string[];
  if(process.env.NODE_ENV === "development") {
    preloadTags = generatePreloadTags(preloadTagFolder!, "/");
  } else {
    preloadTags = generatePreloadTags(process.env.PRELOAD_TAG_FOLDER!, "/");
  }
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
          newTags.link = newTags.link + preloadTags.join("\n");
          newTags.style = newTags.style + "<style>" + css + "</style>";
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
