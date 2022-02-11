const fs = require('fs');
const { constants } = require('fs');
const { Writable } = require('stream');
const { ErrorStream } = require('./../errors');

class WriteStream extends Writable {
  constructor(filename) {
    super();
    this.filename = filename;
    this.fd = null;
  }
  async _open(next) {
    try {
      await fs.promises.access(this.filename, constants.W_OK);
      const open = await fs.promises.open(this.filename, 'a');
      this.fd = open.fd;
      next();
    } catch (e) {
      let err;
      if (e.code === 'EACCES') {
        err = new ErrorStream(`file "${e.path}" access denied`);
      }
      if (e.code === 'ENOENT' || e.code === 'ENOTDIR') {
        err = new ErrorStream(`no such file or directory "${e.path}"`);
      }
      next(err || e);
    }
  }
  _construct(next) {
    this._open(next);
  }
  _write(chunk, encoding, next) {
    fs.write(this.fd, chunk, next);
  }
  _destroy(err, callback) {
    if (this.fd) {
      fs.close(this.fd, (er) => callback(er || err));
    } else {
      callback(err);
    }
  }
}

module.exports = WriteStream;
