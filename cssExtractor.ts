import fs from 'fs';
import path from 'path';




/**
 * Extracts CSS content from all CSS files within a given directory and its subdirectories.
 *
 * @param {string} directoryPath - The path of the directory to traverse for CSS files.
 * @returns {string} The combined CSS content from all CSS files found in the directory and its subdirectories.
 */
export const extractCssFrom = (directoryPath: string): string => {
  let combinedCSS = '';/**
  * Traverses a directory and its subdirectories to find and extract CSS content from CSS files.
  *
  * @param {string} currentPath - The current path being traversed.
  * @returns {void}
  */
  const traverseDirectory = (currentPath: string): void => {
    if(currentPath === undefined) {
      return;
    }
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