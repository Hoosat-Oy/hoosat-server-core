import fs from 'fs';
import path from 'path';

interface FileInfo {
  filePath: string;
  mimeType: string;
}

export function generatePreloadTags(folderPath: string, publicHrefPath: string): string[] {
  const files: FileInfo[] = [];

  // Recursive function to read files from a directory
  function readFilesRecursive(directory: string): void {
    const fileNames = fs.readdirSync(directory);
    fileNames.forEach((fileName) => {
      const filePath = path.join(directory, fileName);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readFilesRecursive(filePath);
      } else {
        const mimeType = getMimeType(filePath);
        files.push({ filePath, mimeType });
      }
    });
  }

  // Function to get the MIME type of a file based on its extension
  function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        return 'text/javascript';
      case '.css':
        return 'text/css';
      // Add more MIME types as needed for other file extensions
      default:
        return '';
    }
  }

  // Function to get the MIME type of a file based on its extension
  function getAs(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        return 'script';
      case '.css':
        return 'style';
      case '.png':
        return 'image';
      case '.ico':
        return 'image';
      case '.svg':
        return 'image';
      case '.jpg':
        return 'image';
      case '.json':
        return 'object';
      case '.txt':
        return 'document';
      case '.map':
        return 'document';
      default:
        return '';
    }
  }

  // Read files from the specified folder path
  readFilesRecursive(folderPath);

  // Generate preload tags
  const preloadTags = files.map(({ filePath }) => {
    const fileName = path.basename(filePath);
    const as = getAs(filePath);
    const href = path.join(publicHrefPath, fileName);
    if(as === '') {
      return '';
    } else {
      return `<link rel="preload" href="${href}" as="${as}" crossorigin="anonymous" />`;
    }
  });

  return preloadTags;
}