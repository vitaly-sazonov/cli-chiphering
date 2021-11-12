const errorHandler = (err) => {
  const { isCustom, code, message, name } = err;
  if (isCustom) {
    console.error(`${name}: ${message}`);
    process.exit(code);
  }
  throw err;
};

module.exports = errorHandler;
