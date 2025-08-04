import {userIsAdmin} from "../utilityFunctions.js";

export function authAdmin(req, res, next) {
  //req.user returned from authHandler mw function since user must be authenticated
  try {
    const cond = userIsAdmin(req);
    if (!cond[0]) return res.send(cond[1]);
    next(); //passing req with its user properties to the next middleware function
  } catch (error) {
    next(err, req, res, next, "authAdmin.js"); //call error handler middleware
  }
}
