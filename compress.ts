import fs from 'fs';
import path from 'path';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream';

/**
 * Compresses all non-compressed files in the build folder and its subdirectories using the specified compression algorithm.
 *
 * @param {string} directoryPath - The path to the directory.
 * @param {string} compressionAlgorithm - The compression algorithm to use ('gzip', 'deflate', or 'br').
 * @returns {void}
 */
export const compressFiles = (directoryPath: string, compressionAlgorithm: string): void => {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile()) {
      const fileExtension = path.extname(file);
      const isCompressed =
        fileExtension === '.gzip' || fileExtension === '.br' || fileExtension === '.deflate';

      if (isCompressed) {
        console.log(`Skipping compression for file: ${filePath}`);
        return;
      }

      const compressedFilePath = `${filePath}.${compressionAlgorithm}`;
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(compressedFilePath);

      let compressionStream;

      if (compressionAlgorithm === 'gzip') {
        compressionStream = zlib.createGzip();
      } else if (compressionAlgorithm === 'deflate') {
        compressionStream = zlib.createDeflate();
      } else if (compressionAlgorithm === 'br') {
        compressionStream = zlib.createBrotliCompress();
      }

      // Check if the streams are valid before creating the pipeline
      if (readStream && writeStream && compressionStream) {
        pipeline(readStream, compressionStream, writeStream, (err) => {
          if (err) {
            console.error(`Error compressing file: ${filePath}`);
            console.error(err);
          } else {
            console.log(`File compressed: ${compressedFilePath}`);
          }
        });
      } else {
        console.error(`Error creating stream for file: ${filePath}`);
      }
    } else if (fileStat.isDirectory()) {
      const subdirectoryPath = path.join(directoryPath, file);
      compressFiles(subdirectoryPath, compressionAlgorithm);
    }
  });

  return;
};
