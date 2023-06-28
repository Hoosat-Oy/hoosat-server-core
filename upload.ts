import { HoosatRequest, HoosatResponse, HoosatRequestHandler } from './types';
import { createWriteStream } from 'fs';

/**
 * Middleware for handling file uploads.
 *
 * @param {string} uploadLocation - The location where uploaded files will be saved.
 * @param {number} [maxFileSize] - The maximum allowed file size in bytes. Default is 10MB.
 * @returns {HoosatRequestHandler} The file upload middleware.
 */
export const upload = (uploadLocation: string, maxFileSize: number = 10 * 1024 * 1024): HoosatRequestHandler => {
  return (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => {
    // Check if the request is a multipart/form-data upload
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const parts = req.body.split(`--${boundary}`);
      parts.shift(); // Remove the first empty part

      for (const part of parts) {
        if (part.trim() === '--') continue; // Skip closing boundary

        const lines = part.split('\r\n');
        const [header, ...contentLines] = lines;

        // Extract the field name and content from the part
        const match = header.match(/name="(.+)"\r\n\r\n/);
        if (match) {
          const fieldName = match[1];
          const content = contentLines.slice(0, -1).join('\r\n'); // Remove last empty line

          // Check if the part represents a file upload
          const fileMatch = header.match(/filename="(.+)"/);
          if (fileMatch) {
            const fileName = fileMatch[1];
            const contentTypeMatch = header.match(/Content-Type: (.+)\r\n/);
            const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';

            const fileData = Buffer.from(content, 'binary');
            if (fileData.length > maxFileSize) {
              // File size exceeds the maximum allowed limit
              return res.status(413).json({ error: 'File size exceeds the maximum limit.' });
            }

            // Store the file information in the request object
            if (!req.files) {
              req.files = {};
            }
            req.files[fieldName] = {
              name: fileName,
              type: contentType,
              data: fileData
            };

            // Save the file to the specified upload location
            const filePath = `${uploadLocation}/${fileName}`;
            const writeStream = createWriteStream(filePath);
            writeStream.write(fileData);
            writeStream.end();
          } else {
            // Regular field value
            req.body[fieldName] = content;
          }
        }
      }
    }
    return next && next(req, res);
  };
};
