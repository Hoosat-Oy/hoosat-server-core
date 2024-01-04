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
      if (decodedURL.startsWith('/public')) {
        decodedURL = decodedURL.slice('/public'.length);
      }
    } catch (error) {
      // Handle the malformed URI error here
      console.error('Malformed URI:', error);
      decodedURL = '';
    }

    let acceptEncoding = req.headers['Accept-Encoding'] as string;
    if (enableCompression === false) {
      acceptEncoding = '';
    }

    const filePath = path.join(publicPath, decodedURL);
    // Check if filePath is a file
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
      return next && next(req, res);
    }

    const getContenType = (ext: string) => {
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.avif') {
        contentType = 'image/avif';
      } else if (ext === '.svg') {
        contentType = 'image/svg+xml';
      } else if (ext === '.otf') {
        contentType = 'font/otf';
      } else if (ext === '.otf') {
        contentType = 'font/otf';
      } else if (ext === '.ttf') {
        contentType = 'font/ttf';
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
      } else if (ext === '.css') {
        contentType = 'text/css';
      } else {
        contentType = 'application/octet-stream';
      }
      return contentType
    }

    const getCacheControl = (ext: string) => {
      if (ext === '.jpg' || ext === '.jpeg') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.png') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.gif') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.avif') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.svg') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.otf') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.otf') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.ttf') {
        cacheControl = 'public, max-age=31536000';
      } else if (ext === '.pdf') {
        cacheControl = 'must-revalidate, public, max-age=31536000';
      } else if (ext === '.txt') {
        cacheControl = 'must-revalidate, public, max-age=31536000';
      } else if (ext === '.csv') {
        cacheControl = 'must-revalidate, public, max-age=31536000';
      } else if (ext === '.json') {
        cacheControl = 'must-revalidate, public, max-age=31536000';
      } else if (ext === '.xml') {
        cacheControl = 'must-revalidate, public, max-age=31536000';
      } else if (ext === '.js') {
        cacheControl = 'must-revalidate, max-age=14400';
      } else if (ext === '.css') {
        cacheControl = 'must-revalidate, max-age=14400';
      } else {
        cacheControl = 'no-cache'
      }
      return cacheControl
    }
    
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    let cacheControl = 'no-cache';

    // Check for compressed files in order and send the compressed file. 
    const compressedExtensions = [".br", ".deflate", ".gzip"];
    for (const encoding of compressedExtensions) {
      if (acceptEncoding.includes(encoding)) {
        const compressedFilePath = filePath + encoding;
        const contentType = getContenType(ext);
        const cacheControl = getCacheControl(ext);
        if(fs.existsSync(compressedFilePath)) {
          const compressedFileStream = fs.createReadStream(compressedFilePath);
          console.log(compressedFilePath);
          console.log(ext);
          console.log(encoding);
          console.log(contentType);
          console.log(cacheControl);
          res.setHeader("Content-Encoding", encoding);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', cacheControl);
          compressedFileStream.pipe(res);
          return;
        }
      }
    }
    contentType = getContenType(ext);
    cacheControl = getCacheControl(ext);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    // If no compressed file found, send the uncompressed file
  };
};