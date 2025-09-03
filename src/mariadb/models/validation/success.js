export class CustomSuccess {
  constructor(message, data = null, display = false, statusCode = 200) {
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.display = display; //display flag used in httpService.js
  }
}
export class Success extends CustomSuccess {
  constructor(message, data, display) {
    super(message, data, display);
  }
}
