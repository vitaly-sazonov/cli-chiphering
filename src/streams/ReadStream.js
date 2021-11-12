const fs = require('fs');
const fsPromise = require('fs/promises');
const { Readable } = require('stream');
const { ErrorStream } = require('./../errors');

class ReadStream extends Readable {
  constructor(filename, encoding) {
    super();
    this.filename = filename;
    this.fd = null;
  }
  _construct(next) {
    fsPromise
      .open(this.filename, 'r')
      .then(({ fd }) => {
        this.fd = fd;
        next();
      })
      .catch((e) => {
        let err;
        if (e.code === 'ENOENT') {
          err = new ErrorStream(`no such file "${e.path}"`);
        }
        if (e.code === 'ENOTDIR') {
          err = new ErrorStream(`no such directory "${e.path}"`);
        }
        next(err || e);
      });
  }
  _read(n) {
    const buf = Buffer.alloc(n);
    fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
      if (err) {
        this.destroy(err);
      } else {
        this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
      }
    });
  }
  _destroy(err, next) {
    if (this.fd) {
      fs.close(this.fd, (er) => next(er || err));
    } else {
      next(err);
    }
  }
}

module.exports = ReadStream;
