import { HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";
import { DEBUG } from "./errors";

/**
 * Creates a CORS middleware that sets the appropriate headers for Cross-Origin Resource Sharing (CORS).
 *
 * @param {string} origins - The allowed origins for CORS requests.
 * @param {string} methods - The allowed HTTP methods for CORS requests.
 * @returns {HoosatRequestHandler} The CORS middleware.
 */
export const cors = (origins: string, methods: string): HoosatRequestHandler => {
  /**
   * Handles the CORS middleware.
   *
   * @callback HoosatRequestHandler
   * @param {HoosatRequest} req - The incoming request object.
   * @param {HoosatResponse} res - The server response object.
   * @param {HoosatRequestHandler|undefined} next - The function to call to proceed to the next middleware or route handler.
   * @returns {void}
   */
  return (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler) => {
    if (!req) {
      DEBUG.log("Error: 'req' parameter is missing.");
      return; 
    }
    if (!res) {
      DEBUG.log("Error: 'res' parameter is missing.");
      return; 
    }
    if (origins === undefined) {
      DEBUG.log("Warning: 'origin' parameter is empty.");
      return;
    }
    if (methods === undefined) {
      DEBUG.log("Warning: 'methods' parameter is empty.");
      return;
    }
    if(req.headers.origin === undefined) {
      res.setHeader('Access-Control-Allow-Origin', origins[0]);
      res.setHeader('Access-Control-Allow-Methods', methods);
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Security-Policy');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if(origins.includes(req.headers.origin.replace("http://", "").replace("https://", ""))) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Methods', methods);
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Security-Policy');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next && next(req, res);
  };
};
