import { createReadStream, createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";
import { DEBUG } from "./errors";
import { compressFiles } from "./compress";

/**
 * middleware that handles file uploads and automatically compresses uploaded files.
 *
 * @function
 * @param {string} uploadLocation - The directory where uploaded files will be stored.
 * @param {number} _maxFileSize - The maximum allowed file size in bytes. Defaults to 10 MB.
 * @returns {HoosatRequestHandler} - A request handler function.
 */
export const upload = (uploadLocation: string, _maxFileSize: number = 10 * 1024 * 1024): HoosatRequestHandler => {
  return async (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => {
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
      // Iterate over the keys in the request body
      for (const key in req.files) {
        const files = req.files[key];
        // Check if the value is an array (to handle multiple file uploads)
        if (Array.isArray(files)) {
          DEBUG.log(`Processing uploaded files for key "${key}"`);
          // Iterate over each uploaded file
          for (const file of files) {
            // Check if the file is successfully uploaded
            if (file.size > 0 && file.filepath) {
              const filePath = `${uploadLocation}/${uuidv4()}-${file.originalFilename}`;
              const writeStream = createWriteStream(filePath);
              // Pipe the file stream (writeStream) to the write stream to save the file
              const readStream = createReadStream(file.filepath);
              readStream.pipe(writeStream);
              file.filepath = filePath;
              file.newFilename = `${uuidv4()}-${file.originalFilename}`;
              // Log the file path
              DEBUG.log(`File saved: ${file.filepath}`);
              compressFiles(uploadLocation, "br");
              compressFiles(uploadLocation, "deflate");
              compressFiles(uploadLocation, "gzip");
            }
          }
        } else {
          DEBUG.log(`No files uploaded for key "${key}"`);
        }
      }
    } else {
      DEBUG.log("Content-type is not multipart/form-data");
    }
    next && next(req, res);
  };
};