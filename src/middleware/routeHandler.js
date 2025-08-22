export function routeHandler(handler) {
  return async (req, res, next) => {
    try {
      if (!req.headers["x-app-origin"]) req.headers["x-app-origin"] = "dev"; //x-app-origin set by nginx reverse proxy in test and prod environment
      await handler(req, res);
    } catch (err) {
      next(err, req, res, next, "routeHandler.js"); //call error handler middleware
    }
  };
}
