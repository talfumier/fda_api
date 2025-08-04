import {UnexpectedError} from "../mariadb/models/validation/errors.js";

export function errorHandler(err, req, res, next, source) {
  res.send(new UnexpectedError(err, source));
}
