/**
 * Debug utility for logging messages to the console.
 * @namespace
 */
export let DEBUG = {
  /**
   * Logs the provided arguments to the console.
   *
   * @memberof DEBUG
   * @function
   * @param {...any} args - The arguments to be logged.
   * @returns {void}
   */
  log: (...args: any[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
};

/**
 * Creates an error handler function that converts an error into a standardized error response.
 *
 * @function
 * @param {unknown} error - The error object to handle.
 * @returns {{ result: string, message: string }} - The standardized error response object.
 * @throws {Error} - If the provided error is not an object or null.
 */
export const ErrorHandler = (error: unknown): { result: string; message: string } => {
  if (typeof error === "object" && error !== null) {
    DEBUG.log(error.toString());
    return { result: "error", message: error.toString() };
  } else {
    DEBUG.log(error);
    throw new Error("Invalid error object");
  }
};
