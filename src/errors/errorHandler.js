const errorHandler = (err) => {
  const { isCustom, code, message, name } = err;
  if (isCustom) {
    console.error(`${name}: ${message}`);
    process.exitCode = code;
    return;
  }
  throw err;
};

module.exports = errorHandler;
