export function selectDb(req, res, next) {
  try {
    const origin = req.headers["X-App-Origin"];
    // origin = dev (dev front-end app > local PC)
    // origin = test (test front-end app > Vercel, Netlify ?)
    // origin = prod (production front-end app > OVH server)
    if (!origin || origin === "dev" || origin === "test")
      req.db = req.app.locals.db.test;
    else req.db = req.app.locals.db.prod;
    next();
  } catch (err) {
    next(err, req, res, next); //call error handler middleware
  }
}
