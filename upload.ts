import { createReadStream, createWriteStream } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";
import { DEBUG } from "./errors";
import { compressFiles } from "./compress";

/**
 * Middleware that handles file uploads and automatically compresses uploaded files.
 *
 * @function
 * @param {string} uploadLocation - The directory where uploaded files will be stored.
 * @param {number} _maxFileSize - The maximum allowed file size in bytes. Defaults to 10 MB.
 * @returns {HoosatRequestHandler} - A request handler function.
 */
export const upload = (uploadLocation: string, _maxFileSize: number = 10 * 1024 * 1024): HoosatRequestHandler => {
  // Ensure the upload location is an absolute path
  const absoluteUploadLocation = path.resolve(uploadLocation);

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
              // Sanitize the filename
              const sanitizedFilename = path.basename(file.originalFilename || "unknown_file");
              // Generate a unique file path
              const filePath = path.join(absoluteUploadLocation, `${uuidv4()}-${sanitizedFilename}`);

              // Ensure the resolved file path is within the upload directory
              if (!filePath.startsWith(absoluteUploadLocation)) {
                DEBUG.error(`Path traversal attempt detected: ${filePath}`);
                res.statusCode = 403; // Forbidden
                res.end("Forbidden");
                return;
              }

              try {
                // Save the file
                const writeStream = createWriteStream(filePath);
                const readStream = createReadStream(file.filepath);
                readStream.pipe(writeStream);
                file.filepath = filePath;
                file.newFilename = `${uuidv4()}-${sanitizedFilename}`;
                DEBUG.log(`File saved: ${file.filepath}`);
              } catch (error) {
                DEBUG.error(`Error saving file: ${error.message}`);
                res.statusCode = 500; // Internal Server Error
                res.end("File upload failed");
                return;
              }

              // Compress the uploaded file
              try {
                compressFiles(absoluteUploadLocation, "br");
                compressFiles(absoluteUploadLocation, "deflate");
                compressFiles(absoluteUploadLocation, "gzip");
              } catch (error) {
                DEBUG.error(`Error compressing file: ${error.message}`);
              }
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
