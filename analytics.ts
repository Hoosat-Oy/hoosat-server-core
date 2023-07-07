import { AnalyticsDTO, HoosatRequest, HoosatRequestHandler, HoosatResponse } from "./types";

/**
 * Creates an analytics middleware that generates JSON data.
 *
 * @param {Function} storeAnalyticsCallback - The callback function to store the analytics data.
 * @returns {HoosatRequestHandler} The analytics middleware.
 */
export const analytics = (storeAnalyticsCallback: (analyticsData: AnalyticsDTO) => void): HoosatRequestHandler => {
  /**
   * A request handler function.
   *
   * @param {HoosatRequest} req - The incoming request object.
   * @param {HoosatResponse} res - The server response object.
   * @returns {void}
   */
  return (req: HoosatRequest, res: HoosatResponse, next?: HoosatRequestHandler): void => {
    const { method, url, headers } = req;
    const { referer, "user-agent": userAgent } = headers;
    const { width, height } = req.body;

    const analyticsData: AnalyticsDTO = {
      element: "document",
      event: "document requested",
      method: method,
      url: url!,
      refererr: referer || "",
      userAgent: userAgent!,
      width,
      height,
      ip: req.socket.remoteAddress!,
    };
    req.analytics = analyticsData;

    storeAnalyticsCallback(analyticsData);

    // Call the next middleware or route handler
    next && next(req, res);
  };
};
