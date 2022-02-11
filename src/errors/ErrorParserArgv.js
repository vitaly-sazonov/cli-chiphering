class ErrorParserArgv extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorParserArgv';
    this.code = 1;
    this.isCustom = true;
  }
}

module.exports = ErrorParserArgv;
