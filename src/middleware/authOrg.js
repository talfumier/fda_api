import {userIsOrg} from "../utilityFunctions.js";

export function authOrg(req, res, next) {
  //req.user returned from authHandler mw function since user must be authenticated
  try {
    const cond = userIsOrg(req);
    if (!cond[0]) {
      return res.send(cond[1]);
    }
    next(); //passing req with its user properties to the next middleware function
  } catch (error) {
    next(err, req, res, next, "authOrg.js"); //call error handler middleware
  }
}
