import jwt from "jsonwebtoken";
import {environment} from "../config/environment.js";
import {Unauthorized} from "../mariadb/models/validation/errors.js";

export function authHandler(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.send(new Unauthorized("Access denied. No token provided."));
  try {
    req.token = token;
    const decoded = jwt.verify(token, environment.sha256);
    req.user = decoded;
    next(); //passing req with its user properties to the next middleware function
  } catch (err) {
    next(err, req, res, next, "authHandler.js"); //call error handler middleware
  }
}
