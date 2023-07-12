import fs from 'fs';
import path from 'path';
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from './types';

/**
 * Creates a middleware for serving static assets from a specified public directory.
 *
 * @param {string} publicPath - The path to the public directory where the assets are located.
 * @returns {HoosatRequestHandler} The CORS middleware.
 */
export const assets = (publicPath: string, enableCompression = false): HoosatRequestHandler => {
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

    let acceptEncoding = req.headers['accept-encoding'] as string;
    if (!acceptEncoding) {
      acceptEncoding = '';
    }
    if (enableCompression === false) {
      acceptEncoding = '';
    }

    const filePath = path.join(publicPath, decodedURL);

    // Check if filePath is a file
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
      return next && next(req, res);
    }

    const fileStream = fs.createReadStream(filePath);

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
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate, stale-if-error=3600 must-understand, no-store, immutable')

    if (/\bbr\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding','br');
      try {
        const compressedFileStream = fs.createReadStream(filePath + ".br");
        compressedFileStream.pipe(res);
      } catch (error) {
        fileStream.pipe(res);
      }
    } else if (/\bdeflate\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding','deflate');
      try {
        const compressedFileStream = fs.createReadStream(filePath + ".deflate");
        compressedFileStream.pipe(res);
      } catch (error) {
        fileStream.pipe(res);
      }
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding','gzip');
      try {
        const compressedFileStream = fs.createReadStream(filePath + ".gzip");
        compressedFileStream.pipe(res);
      } catch (error) {
        fileStream.pipe(res);
      }
    } else  {
      fileStream.pipe(res);
    }
  };
};