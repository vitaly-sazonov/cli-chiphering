class ErrorStream extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorStream';
    this.code = 1;
    this.isCustom = true;
  }
}

module.exports = ErrorStream;
