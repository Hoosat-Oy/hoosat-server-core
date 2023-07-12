import fs from 'fs';
import path from 'path';

interface FileInfo {
  filePath: string;
  mimeType: string;
}

/**
 * Generates preload tags for the files in a given folder.
 * 
 * @param folderPath - The path of the folder containing the files.
 * @param publicHrefPath - The public href path for the files.
 * @returns An array of preload tags.
 */
export function generatePreloadTags(folderPath: string, publicHrefPath: string): string[] {
  const files: FileInfo[] = [];

  /**
   * Recursive function to read files from a directory.
   * 
   * @param directory - The path of the directory to read files from.
   */
  function readFilesRecursive(directory: string): void {
    const fileNames = fs.readdirSync(directory);
    fileNames.forEach((fileName) => {
      const filePath = path.join(directory, fileName);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readFilesRecursive(filePath);
      } else {
        const mimeType = getMimeType(filePath);
        const relativePath = path.relative(folderPath, filePath);
        files.push({ filePath: relativePath, mimeType });
      }
    });
  }

  /**
   * Gets the MIME type of a file based on its extension.
   * 
   * @param filePath - The path of the file.
   * @returns The MIME type of the file.
   */
  function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        return 'text/javascript';
      case '.css':
        return 'text/css';
      case '.png':
        return 'image/png';
      case '.ico':
        return 'image/x-icon';
      case '.svg':
        return 'image/svg+xml';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.bmp':
        return 'image/bmp';
      case '.webp':
        return 'image/webp';
      case '.tif':
      case '.tiff':
        return 'image/tiff';
      case '.psd':
        return 'image/vnd.adobe.photoshop';
      case '.ai':
        return 'application/postscript';
      case '.eps':
        return 'application/postscript';
      case '.raw':
        return 'image/x-raw';
      case '.indd':
        return 'application/x-indesign';
      case '.json':
        return 'application/json';
      case '.txt':
        return 'text/plain';
      case '.map':
        return 'application/json';
      case '.pdf':
        return 'application/pdf';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.xls':
        return 'application/vnd.ms-excel';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.ppt':
        return 'application/vnd.ms-powerpoint';
      case '.pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.ogg':
        return 'audio/ogg';
      case '.mp4':
        return 'video/mp4';
      case '.avi':
        return 'video/x-msvideo';
      case '.mov':
        return 'video/quicktime';
      case '.mkv':
        return 'video/x-matroska';
      case '.webm':
        return 'video/webm';
      case '.flv':
        return 'video/x-flv';
      case '.eot':
        return 'application/vnd.ms-fontobject';
      case '.otf':
        return 'font/otf';
      case '.ttf':
        return 'font/ttf';
      case '.woff':
        return 'font/woff';
      case '.woff2':
        return 'font/woff2';
      case '.vtt':
        return 'text/vtt';
      case '.wasm':
        return 'application/wasm';
      case '.html':
        return 'text/html';
      case '.htm':
        return 'text/html';
      case '.worker.js':
        return 'text/javascript';
      case '.worker.ts':
        return 'text/typescript';
      default:
        return '';
    }
  }
  
  /**
   * Gets the resource type for a given file based on its extension.
   * 
   * @param filePath - The path of the file.
   * @returns The resource type for the file.
   */
  function getAs(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        return 'script';
      case '.css':
        return 'style';
      case '.png':
      case '.ico':
      case '.svg':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.bmp':
      case '.webp':
      case '.tif':
      case '.tiff':
      case '.psd':
      case '.ai':
      case '.eps':
      case '.raw':
      case '.indd':
        return 'image';
      case '.json':
      case '.txt':
      case '.map':
      case '.pdf':
      case '.doc':
      case '.docx':
      case '.xls':
      case '.xlsx':
      case '.ppt':
      case '.pptx':
      case '.wasm':
      case '.vtt':
      case '.html':
      case '.htm':
      case '.worker.js':
      case '.worker.ts':
        return 'fetch';
      case '.mp3':
      case '.wav':
      case '.ogg':
        return 'audio';
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.mkv':
      case '.webm':
      case '.flv':
        return 'video';
      case '.eot':
      case '.otf':
      case '.ttf':
      case '.woff':
      case '.woff2':
        return 'font';
      default:
        return '';
    }
  }


  // Read files from the specified folder path
  readFilesRecursive(folderPath);

  // Generate preload tags
  const preloadTags = files.map(({ filePath }) => {
    const fileName = path.basename(filePath);
    const toSkip = ['.map', '.txt', '.other', '.json']; 
    for (const extension of toSkip) {
      if (fileName.endsWith(extension)) {
        return "\r\n";
      }
    }
    const as = getAs(filePath);
    const href = path.join(publicHrefPath, filePath);
    if (as === '') {
      return '\r\n';
    } else {
      return `<link rel="preload" href="${href}" as="${as}" crossorigin="anonymous"/>\r\n`;
    }
  });

  return preloadTags;
}