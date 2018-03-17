class CodeError {
  constructor(code, v) {
    if (typeof v === 'string') {
      this.name = this.constructor.name;
      this.message = message;
      this.stack = new Error(message).stack;
      this.code = code;
    } else {
      this.name = v.name || 'error';
      this.message = v.message;
      this.stack = v.stack;
      this.code = code;
    }
  }
}

CodeError.prototype = Object.create(Error.prototype);
CodeError.prototype.constructor = CodeError;

module.exports = CodeError;
