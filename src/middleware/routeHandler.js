import {environment} from "../config/environment.js";
export function routeHandler(handler) {
  return async (req, res, next) => {
    try {
      if (!req.headers["x-app-origin"])
        req.headers["x-app-origin"] = environment.prod_in_dev ? "prod" : "dev"; //x-app-origin set by nginx reverse proxy in test and prod environment
      await handler(req, res);
    } catch (err) {
      next(err, req, res, next, "routeHandler.js"); //call error handler middleware
    }
  };
}
