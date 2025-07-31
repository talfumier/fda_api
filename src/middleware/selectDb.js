export function selectDb(req, res, next) {
  try {
    // origin = dev (dev front-end app > local PC)
    // origin = test (test front-end app > Vercel, Netlify ?)
    // origin = prod (production front-end app > OVH server)
    if (req.headers["x-app-origin"] === "prod") req.db = req.app.locals.db.prod;
    else req.db = req.app.locals.db.test;

    req.lang = req.headers["accept-language"];

    next();
  } catch (err) {
    next(err, req, res, next); //call error handler middleware
  }
}
