import fs from 'fs';
import path from 'path';
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from './types';

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
      if (decodedURL.startsWith('/public')) {
        decodedURL = decodedURL.slice('/public'.length);
      }
    } catch (error) {
      console.error('Malformed URI:', error);
      return;
    }
    let acceptEncoding = req.headers['accept-encoding'] as string;

    const filePath = path.join(publicPath, decodedURL);
    // Check if filePath is a file
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
      return next && next(req, res);
    }

    const ext = path.extname(filePath).toLowerCase();

    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
      '.svg': 'image/svg+xml',
      '.otf': 'font/otf',
      '.ttf': 'font/ttf',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'text/xml',
      '.html': 'text/html',
      '.xhtml': 'application/xhtml+xml',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mp3',
      '.wav': 'audio/wav',
      '.ico': 'image/x-icon',
    };

    const cacheControlMap: { [key: string]: string } = {
      '.jpg': 'public, max-age=31536000',
      '.jpeg': 'public, max-age=31536000',
      '.png': 'public, max-age=31536000',
      '.gif': 'public, max-age=31536000',
      '.avif': 'public, max-age=31536000',
      '.svg': 'public, max-age=31536000',
      '.otf': 'public, max-age=31536000',
      '.ttf': 'public, max-age=31536000',
      '.pdf': 'must-revalidate, public, max-age=31536000',
      '.txt': 'must-revalidate, public, max-age=14400',
      '.csv': 'must-revalidate, public, max-age=14400',
      '.json': 'must-revalidate, public, max-age=14400',
      '.xml': 'must-revalidate, public, max-age=14400',
      '.html': 'must-revalidate, public, max-age=14400',
      '.xhtml': 'must-revalidate, public, max-age=14400',
      '.js': 'must-revalidate, max-age=14400',
      '.css': 'must-revalidate, public, max-age=14400',
      '.mp4': 'public, max-age=31536000',
      '.mp3': 'public, max-age=31536000',
      '.wav': 'public, max-age=31536000',
      '.ico': 'public, max-age=31536000',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    const cacheControl = cacheControlMap[ext] || 'no-cache';

    if (acceptEncoding !== undefined) {
      const compressedExtensions = ['.br', '.deflate', '.gzip'];
      for (const encoding of compressedExtensions) {
        if (acceptEncoding.includes(encoding.replace(".", ""))) {
          const compressedFilePath = filePath + encoding;
          if (fs.existsSync(compressedFilePath)) {
            const compressedFileStream = fs.createReadStream(compressedFilePath);
            res.setHeader('Content-Encoding', encoding.replace(".", ""));
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', cacheControl);
            compressedFileStream.pipe(res);
            return;
          }
        }
      }
    }

    // If no compressed file found, serve the uncompressed file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  };
};