import fs from 'fs';
import path from "path";
import { DEBUG } from "./errors";
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "../../@types";

/**
 * Creates a middleware for serving static assets from a specified public directory.
 *
 * @param {string} publicPath - The path to the public directory where the assets are located.
 * @returns {HoosatRequestHandler} The CORS middleware.
 */
export const assets = (publicPath: string): HoosatRequestHandler => {
  /**
   * A request handler function.
   *
   * @param {HoosatRequest} req - The incoming request object.
   * @param {HoosatResponse} res - The server response object.
   * @param {HoosatRequestHandler} next - The function to call to proceed to the next middleware or route handler.
   * @returns {void}
   */
  return (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler): void => {
    const filePath = path.join(publicPath, req.url || '');
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('open', () => {
      res.setHeader('Content-Type', 'text/html'); 
      fileStream.pipe(res.serverResponse);
    });

    fileStream.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT' || (err as NodeJS.ErrnoException).code === 'EISDIR') {
        next && next(req, res);
      } else {
        DEBUG.log(`Error reading file: ${filePath}`);
        DEBUG.log(err);
        res.status(500).send("Internal Server Error");
      }
    });
  };
};