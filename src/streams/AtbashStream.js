const { Transform } = require('stream');

class AtbashStream extends Transform {
  constructor(opt = {}) {
    opt = { decodeStrings: false, ...opt };
    super(opt);
    this._shift = (begin, asciiCode, end) => String.fromCharCode(end - asciiCode + begin);
  }

  _transform(chunk, encoding, next) {
    if (encoding == 'buffer') {
      chunk = chunk.toString('utf8');
    }
    this.push(this._coding(chunk));
    next();
  }

  _coding(string) {
    const strlen = string.length;
    let chunk = '';
    for (let i = 0; i < strlen; i++) {
      const asciiCode = string.charCodeAt(i);
      if (asciiCode >= 97 && asciiCode <= 122) {
        chunk += this._shift(97, asciiCode, 122);
        continue;
      }
      if (asciiCode >= 65 && asciiCode <= 90) {
        chunk += this._shift(65, asciiCode, 90);
        continue;
      }
      chunk += string[i];
    }
    return chunk;
  }
}

module.exports = AtbashStream;
