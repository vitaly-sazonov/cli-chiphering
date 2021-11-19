'use strict';

const fs = jest.createMockFromModule('fs');
const {
  MockErrorENOENT,
  MockErrorENOTDIR,
  MockErrorDestroy,
  MockErrorClose,
  MockErrorWrite,
  MockErrorEACCES,
} = require('./_errors');

const TEST_TEXT = 'test text';
const ERROR = 'error';
const ENOENT = 'ENOENT';
const ENOTDIR = 'ENOTDIR';
const DESTROY = 'destroy';
const CLOSE_SUCCESS = 'closeSuccess';
const CLOSE_FAILED = 'closeFailed';
const NORMAL_READ = 'normalRead';
const NORMAL_WRITE = 'normalWrite';
const EACCES = 'access';

const file = { fd: 10 };
let __test,
  __isRead = true,
  _testStringWrite = '';
const __setTest = (mode) => {
  __test = mode;
  __isRead = ![NORMAL_READ, CLOSE_SUCCESS, CLOSE_FAILED].includes(mode);
  //if (mode == NORMAL_WRITE) _testStringWrite = '';
};

const open = (filename) => {
  const scenarious = {
    [ERROR]: (res, rej) => rej(new Error()),
    [ENOENT]: (res, rej) => rej(new MockErrorENOENT()),
    [ENOTDIR]: (res, rej) => rej(new MockErrorENOTDIR()),
    [DESTROY]: (res) => res({ fd: false }),
    [CLOSE_SUCCESS]: (res) => res(file),
    [CLOSE_FAILED]: (res) => res(file),
    [NORMAL_READ]: (res) => res(file),
    [NORMAL_WRITE]: (res) => res(file),
    [EACCES]: (res) => res(file),
  };

  return new Promise((res, rej) => scenarious[__test](res, rej));
};

const read = (fd, buffer, offset, length, position, next) => {
  if (__test == NORMAL_READ || __test == CLOSE_SUCCESS || __test == CLOSE_FAILED) {
    if (!__isRead) {
      next(false, buffer.write(TEST_TEXT, 'utf-8'));
      __isRead = true;
    } else next(false, 0);
  } else next(new MockErrorDestroy());
};

const close = jest.fn((fd, next) => {
  if (__test == CLOSE_FAILED) next(new MockErrorClose());
  next();
});

const write = jest.fn((fd, chunk, next) => {
  if (__test == NORMAL_WRITE) {
    _testStringWrite += chunk.toString('utf8');
    next();
    return;
  }
  next(new MockErrorDestroy());
});

const access = jest.fn(() => {
  return new Promise((res, rej) => {
    if (__test == EACCES) rej(new MockErrorEACCES());
    res();
  });
});

fs.promises = { open, access };
fs.__setTest = __setTest;
fs.read = read;
fs.write = write;
fs._testStringWrite = () => _testStringWrite;
fs.close = close;

module.exports = fs;
module.exports.constants = {
  TEST_TEXT,
  ERROR,
  ENOENT,
  ENOTDIR,
  DESTROY,
  CLOSE_SUCCESS,
  CLOSE_FAILED,
  NORMAL_READ,
  NORMAL_WRITE,
  EACCES,
};
