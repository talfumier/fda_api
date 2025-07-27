export function selectDb(req, res, next) {
  const origin = req.headers["x-app-origin"];
  req.db =
    origin === "internal" ? req.app.locals.db.prod : req.app.locals.db.test;
  next();
}
