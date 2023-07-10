import fs from 'fs';
import path from "path";
import { DEBUG } from "./errors";
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";

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
    let decodedURL: string;
    try {
      decodedURL = decodeURIComponent(req.url || '');
    } catch (error) {
      // Handle the malformed URI error here
      console.error('Malformed URI:', error);
      decodedURL = '';
    }
    const filePath = path.join(publicPath, decodedURL);
    const fileStream = fs.createReadStream(filePath);


    fileStream.on('open', () => {
      // Set the appropriate content type based on the file extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';

      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.txt') {
        contentType = 'text/plain';
      } else if (ext === '.csv') {
        contentType = 'text/csv';
      } else if (ext === '.json') {
        contentType = 'application/json';
      } else if (ext === '.xml') {
        contentType = 'application/xml';
      } else if (ext === '.js') {
        contentType = 'application/javascript';
      }

      res.setHeader('Content-Type', contentType);
    });

    fileStream.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT' || (err as NodeJS.ErrnoException).code === 'EISDIR') {
        return next && next(req, res);
      } else {
        DEBUG.log(`Error reading file: ${filePath}`);
        DEBUG.log(err);
        res.status(500).send("Internal Server Error");
      }
    });

    fileStream.on('end', () => {
      res.end();
    });
    fileStream.pipe(res);
  };
};
