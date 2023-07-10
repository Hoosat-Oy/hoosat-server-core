import fs from 'fs';
import path from 'path';

export const extractCssFrom = (directoryPath: string): string => {
  let combinedCSS = '';

  function traverseDirectory(currentPath: string) {
    const directoryContents = fs.readdirSync(currentPath);

    for (const item of directoryContents) {
      const itemPath = path.join(currentPath, item);
      const itemStat = fs.statSync(itemPath);

      if (itemStat.isDirectory()) {
        traverseDirectory(itemPath); // Recursively traverse subdirectories
      } else if (itemStat.isFile() && path.extname(item) === '.css') {
        const cssContent = fs.readFileSync(itemPath, 'utf-8');
        combinedCSS += cssContent; // Append CSS content to the combinedCSS string
      }
    }
  }

  traverseDirectory(directoryPath);
  return combinedCSS;
}