class MockErrorENOENT extends Error {
  constructor(message, path) {
    super(message);
    this.name = 'MockErrorENOENT';
    this.code = 'ENOENT';
  }
}

class MockErrorENOTDIR extends Error {
  constructor(message, path) {
    super(message);
    this.name = 'MockErrorENOTDIR';
    this.code = 'ENOTDIR';
  }
}

class MockErrorDestroy extends Error {
  constructor(message) {
    super(message);
    this.name = 'MockErrorDestroy';
  }
}

class MockErrorClose extends Error {
  constructor(message) {
    super(message);
    this.name = 'MockErrorClose';
  }
}

class MockErrorWrite extends Error {
  constructor(message) {
    super(message);
    this.name = 'MockErrorWrite';
  }
}

class MockErrorEACCES extends Error {
  constructor(message) {
    super(message);
    this.name = 'MockErrorEACCES';
    this.code = 'EACCES';
  }
}

module.exports = {
  MockErrorENOENT,
  MockErrorENOTDIR,
  MockErrorDestroy,
  MockErrorClose,
  MockErrorWrite,
  MockErrorEACCES,
};
