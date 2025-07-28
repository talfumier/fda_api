export function selectDb(req, res, next) {
  try {
    const origin = req.headers["x-app-origin"];
    req.db =
      origin === "internal" ? req.app.locals.db.prod : req.app.locals.db.test;
    next();
  } catch (err) {
    next(err, req, res, next); //call error handler middleware
  }
}
