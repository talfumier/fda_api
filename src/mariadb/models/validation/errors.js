export class CustomError {
  constructor(
    general = "general error description",
    statusCode = 500,
    message,
    msgType = "non-persistent"
  ) {
    this.name = this.constructor.name;
    this.general = general;
    this.statusCode = statusCode;
    this.message = message;
    this.msgType = msgType;
  }
}
export class BadRequest extends CustomError {
  constructor(message) {
    super("Cannot process the request as it stands.", 400, message);
  }
}
export class NotFound extends CustomError {
  constructor(message) {
    super("The requested resource could not be found.", 404, message);
  }
}
export class Unauthorized extends CustomError {
  constructor(message, msgType) {
    super(
      "Unauthorized Access. Authentication required or invalid.",
      401,
      message,
      msgType
    );
  }
}
export class Conflict extends CustomError {
  constructor(message, msgType) {
    super("Database tables conflict.", 409, message, msgType);
  }
}
export class InternalServerError extends CustomError {
  constructor(message) {
    super("Oooops something wrong happened.", 500, message);
  }
}
export class UnexpectedError extends CustomError {
  constructor(message, source) {
    super("An unexpected error has occured.", source, message);
  }
}
