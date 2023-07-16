import { renderToPipeableStream } from "react-dom/server";
import { FilledContext } from "react-helmet-async";
import { extractCssFrom } from "./cssExtractor";
import { generatePreloadTags } from "./preload";
import { replaceHeadTags } from "./seo";
import { HoosatResponse } from "./types";
import { DEBUG, ErrorHandler } from "./errors";
import { ReactNode, JSX } from "react";


interface HoosatRenderer {
  res: HoosatResponse,
  jsx: ReactNode | JSX.Element,
  helmetContext: object,
  extractCSS: boolean,
  preloadTagFolder: string,
}

/**
 * Renders a React JSX element or ReactNode to a pipeable stream and sends the response to the client.
 * This function is designed for server-side rendering (SSR) in a Hoosat application.
 *
 * @param {HoosatRenderer} params - The arguments for Hoosat server side renderer.
 * @returns {void}
 */
export const renderer = (params: HoosatRenderer): void => {
  const { res, jsx, helmetContext, extractCSS, preloadTagFolder } = params;
  let css = "";
  if(extractCSS == true) {
    css = extractCssFrom("./src/client");
  }
  let preloadTags: string[];
  if(process.env.NODE_ENV === "development") {
    preloadTags = generatePreloadTags(preloadTagFolder, "/");
  } else {
    preloadTags = generatePreloadTags(process.env.PRELOAD_TAG_FOLDER!, "/");
  }
  // Rendering the App component to a pipeable stream
  const stream = renderToPipeableStream(
    jsx,
    {
      bootstrapModules: ["/bundle.js"],
      onShellReady: async () => {
        const { helmet } = helmetContext as FilledContext;
        while (!helmet?.title) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        DEBUG.log(helmet);
        DEBUG.log(helmet.title.toString());
        const replaceStream = replaceHeadTags({
          title: helmet?.title?.toString(),
          meta: helmet?.meta?.toString(),
          link: preloadTags.join("\n") + (helmet?.link?.toString()),
          script: helmet?.script?.toString(),
          base: helmet?.base?.toString(),
          style: "<style>" + css + "</style>" + helmet?.style?.toString(),
        });
        res.setHeader('content-type', 'text/html');
        stream.pipe(replaceStream).pipe(res);
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