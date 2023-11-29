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

    // Set the appropriate content type and cache control based on the file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    let cacheControl = 'public, max-age=14400';

    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
      cacheControl = 'public, max-age=31536000';
    } else if (ext === '.png') {
      contentType = 'image/png';
      cacheControl = 'public, max-age=31536000';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
      cacheControl = 'public, max-age=31536000';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
      cacheControl = 'public, max-age=31536000';
    }  else if (ext === '.pdf') {
      contentType = 'application/pdf';
      cacheControl = 'must-revalidate, public, max-age=31536000';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
      cacheControl = 'must-revalidate, public, max-age=31536000';
    } else if (ext === '.csv') {
      contentType = 'text/csv';
      cacheControl = 'must-revalidate, public, max-age=31536000';
    } else if (ext === '.json') {
      contentType = 'application/json';
      cacheControl = 'must-revalidate, public, max-age=31536000';
    } else if (ext === '.xml') {
      contentType = 'application/xml';
      cacheControl = 'must-revalidate, public, max-age=31536000';
    } else if (ext === '.js') {
      contentType = 'application/javascript';
      cacheControl = 'must-revalidate, max-age=14400';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);

    // Check for compressed files in order and send the compressed file. 
    const compressedExtensions = [".br", ".deflate", ".gzip"];
    for (const extension of compressedExtensions) {
      const compressedFilePath = filePath + extension;
      if (fs.existsSync(compressedFilePath)) {
        let encoding;
        if (extension === ".br") {
          encoding = "br";
        } else if (extension === ".deflate") {
          encoding = "deflate";
        } else if (extension === ".gzip") {
          encoding = "gzip";
        }
        const compressedFileStream = fs.createReadStream(compressedFilePath);
        res.setHeader("Content-Encoding", encoding);
        compressedFileStream.pipe(res);
        return; // Exit the loop and the function
      }
    }

    // If no compressed file found, send the uncompressed file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  };
};