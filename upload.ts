import { createReadStream, createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";


export const upload = (_uploadLocation: string, _maxFileSize: number = 10 * 1024 * 1024): HoosatRequestHandler => {
  return async (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => {

    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {

      // Create an array to store the updated file information

      // Iterate over the keys in the request body
      for (const key in req.files) {
        const files = req.files[key];

        // Check if the value is an array (to handle multiple file uploads)
        if (Array.isArray(files)) {
          console.log(`Processing uploaded files for key "${key}"`);

          // Iterate over each uploaded file
          for (const file of files) {
            // Check if the file is successfully uploaded
            if (file.size > 0 && file.filepath) {
              const filePath = `${_uploadLocation}/${uuidv4()}-${file.originalFilename}`;
              const writeStream = createWriteStream(filePath);

              // Pipe the file stream (writeStream) to the write stream to save the file
              const readStream = createReadStream(file.filepath);
              readStream.pipe(writeStream);
              file.filepath = filePath;
              file.newFilename = `${uuidv4()}-${file.originalFilename}`;
              // Log the file path
              console.log(`File saved: ${file.filepath}`);
            }
          }
        } else {
          console.log(`No files uploaded for key "${key}"`);
        }
      }
    } else {
      console.log("Content-type is not multipart/form-data");
    }
    next && next(req, res);
  };
};