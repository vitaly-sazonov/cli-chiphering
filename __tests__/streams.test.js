const { ErrorStream } = require('../src/errors');
const { ReadStream, WriteStream, AtbashStream, RotateStream } = require('../src/streams');

const { MockErrorDestroy, MockErrorClose } = require('../__mocks__/_errors');
const { constants } = require('../__mocks__/fs');

const fs = require('fs');

jest.mock('fs');

describe('Testing ReadStream', () => {
  test('If there is no File for reading, then then we catch ErrorStream', (done) => {
    fs.__setTest(constants.ENOENT);
    const read = new ReadStream('./input.txt');
    read.on('error', (err) => {
      expect(err).toBeInstanceOf(ErrorStream);
      done();
    });
  });

  test('if no directory is missing, then then we catch ErrorStream', (done) => {
    fs.__setTest(constants.ENOTDIR);
    const read = new ReadStream('./input.txt');
    read.on('error', (err) => {
      expect(err).toBeInstanceOf(ErrorStream);
      done();
    });
  });

  test('If another error occurs, then then we catch Error', (done) => {
    fs.__setTest(constants.ERROR);
    const read = new ReadStream('./input.txt');
    read.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('If the file is read successfully, then we get the data from the file', (done) => {
    fs.__setTest(constants.NORMAL_READ);
    const read = new ReadStream('./input.txt');
    read.on('data', (data) => {
      expect(data.toString('utf8')).toBe(constants.TEST_TEXT);
      done();
    });
  });

  test('If an error occurs while reading, then close the stream and throw the error', (done) => {
    fs.__setTest(constants.DESTROY);
    const read = new ReadStream('./input.txt');
    read.on('error', (err) => {
      expect(err).toBeInstanceOf(MockErrorDestroy);
      done();
    });
    read.on('data', (data) => {});
  });

  test('If there is an error when closing the file, then throw the error', (done) => {
    fs.__setTest(constants.CLOSE_FAILED);
    const read = new ReadStream('./input.txt');
    read.on('error', (err) => {
      expect(fs.close).toHaveBeenCalled();
      expect(err).toBeInstanceOf(MockErrorClose);
      done();
    });
    read.on('data', (data) => {});
  });

  test('If the stream is over, then the file has been successfully closed', (done) => {
    fs.__setTest(constants.CLOSE_SUCCESS);
    const read = new ReadStream('./input.txt');
    read.on('data', (data) => {});
    read.on('end', () => {
      expect(fs.close).toHaveBeenCalled();
      done();
    });
  });
});

// ------------------------------

describe('Testing WriteStream', () => {
  test('if there is no access to the file, then then we catch ErrorStream', (done) => {
    fs.__setTest(constants.EACCES);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(err).toBeInstanceOf(ErrorStream);
      done();
    });
  });

  test('If there is no File for writing, then then we catch ErrorStream', (done) => {
    fs.__setTest(constants.ENOENT);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(fs.promises.access).toHaveBeenCalled();
      expect(err).toBeInstanceOf(ErrorStream);
      done();
    });
  });

  test('if no directory is missing, then then we catch ErrorStream', (done) => {
    fs.__setTest(constants.ENOTDIR);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(fs.promises.access).toHaveBeenCalled();
      expect(err).toBeInstanceOf(ErrorStream);
      done();
    });
  });

  test('If another error occurs, then then we catch Error', (done) => {
    fs.__setTest(constants.ERROR);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(fs.promises.access).toHaveBeenCalled();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  test('Data is written to the file streaming successfully', (done) => {
    const { PassThrough, pipeline } = require('stream');
    fs.__setTest(constants.NORMAL_WRITE);
    const fakeStream = new PassThrough();
    const write = new WriteStream('./output.txt');
    write.on('finish', () => {
      expect(fs._testStringWrite()).toBe(constants.TEST_TEXT);
      expect(fs.write).toHaveBeenCalled();
      expect(fs.close).toHaveBeenCalled();
      done();
    });
    write.end(constants.TEST_TEXT);
  }, 500);

  test('If the file write crashes, then an error is caught', (done) => {
    fs.__setTest(constants.DESTROY);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(fs.write).toHaveBeenCalled();
      expect(err).toBeInstanceOf(MockErrorDestroy);
      done();
    });
    write.end(constants.TEST_TEXT);
  });

  test('If there is an error when closing the file, then throw the error', (done) => {
    fs.__setTest(constants.CLOSE_FAILED);
    const write = new WriteStream('./output.txt');
    write.on('error', (err) => {
      expect(fs.close).toHaveBeenCalled();
      expect(err).toBeInstanceOf(MockErrorClose);
      done();
    });
    write.end(constants.TEST_TEXT);
  });
});

// ------------------------------

describe('Testing TransformStreams', () => {
  const { PassThrough, pipeline } = require('stream');
  let emitTextStream = new PassThrough();
  let receiveTextStream = new PassThrough();

  const opt = { decodeStrings: true };
  const BlackBoxTestingStreamFn = (done, testingStream, inputString, outputString) => {
    pipeline(emitTextStream, testingStream, receiveTextStream, () => {});
    receiveTextStream.on('data', (data) => {
      const string = data.toString('utf8');
      expect(string).toBe(outputString);
      done();
    });
    emitTextStream.emit('data', inputString);
    emitTextStream.emit('end');
  };

  afterEach(() => {
    receiveTextStream.destroy();
    emitTextStream.destroy();
    receiveTextStream = new PassThrough();
    emitTextStream = new PassThrough();
  });

  test('Atbash stream rotate string from "a-Z" to "z-A"', (done) => {
    const input = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const output = 'zyxwvutsrqponmlkjihgfedcba ZYXWVUTSRQPONMLKJIHGFEDCBA';
    BlackBoxTestingStreamFn(done, new AtbashStream(opt), input, output);
  });

  test('Atbash stream rotate string from "a-Z" to "z-A"', (done) => {
    const input = 'zyxwvutsrqponmlkjihgfedcba ZYXWVUTSRQPONMLKJIHGFEDCBA';
    const output = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    BlackBoxTestingStreamFn(done, new AtbashStream(opt), input, output);
  });

  test('Caesar stream alphabet 1 character forward "a->b", "b->c", ...', (done) => {
    const input = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const output = 'bcdefghijklmnopqrstuvwxyza BCDEFGHIJKLMNOPQRSTUVWXYZA';
    BlackBoxTestingStreamFn(done, new RotateStream(opt, 1, true), input, output);
  });

  test('Caesar stream alphabet 1 character back "a->z", "b->a", ...', (done) => {
    const input = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const output = 'zabcdefghijklmnopqrstuvwxy ZABCDEFGHIJKLMNOPQRSTUVWXY';
    BlackBoxTestingStreamFn(done, new RotateStream(opt, 1, false), input, output);
  });

  test('ROT8 stream alphabet 8 character forward "a->i", "b->j", ...', (done) => {
    const input = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const output = 'ijklmnopqrstuvwxyzabcdefgh IJKLMNOPQRSTUVWXYZABCDEFGH';
    BlackBoxTestingStreamFn(done, new RotateStream(opt, 8, true), input, output);
  });

  test('ROT8 stream alphabet 8 character back "a->s", "b->t", ...', (done) => {
    const input = 'ijklmnopqrstuvwxyzabcdefgh IJKLMNOPQRSTUVWXYZABCDEFGH';
    const output = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    BlackBoxTestingStreamFn(done, new RotateStream(opt, 8, false), input, output);
  });
});
