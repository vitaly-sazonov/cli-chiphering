const { Transform } = require('stream');

class RotateStream extends Transform {
  constructor(opt = {}, shift, encode) {
    opt = { decodeStrings: false, ...opt };
    super(opt);

    this._shift = (begin, asciiCode, end) => {
      const pos = asciiCode - begin; // position literal in alphabet from 0 to 25
      const indexWithShift = encode ? pos + shift : pos - shift; // encoding -> left shift, decoding -> right shift
      const newIndex = indexWithShift < 0 ? 26 + indexWithShift : indexWithShift % 26; // 25 literal in alphabet, begin from 0
      return String.fromCharCode(newIndex + begin);
    };
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

module.exports = RotateStream;
