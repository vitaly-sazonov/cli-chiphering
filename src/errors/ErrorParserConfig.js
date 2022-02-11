class ErrorParserConfig extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorParserConfig';
    this.code = 1;
    this.isCustom = true;
  }
}

module.exports = ErrorParserConfig;
