const fs = require('fs');
const { pipeline } = require('stream');
const parserCLI = require('./src/cli-parser');
const { ReadStream, WriteStream, AtbashStream, RotateStream } = require('./src/streams');
const { errorHandler } = require('./src/errors');

try {
  const { config, input, output } = new parserCLI().run(process.argv);

  const streamsCipher = config.map(([cipher, encode]) => {
    if (cipher == 'A') return new AtbashStream();
    if (cipher == 'C') return new RotateStream({}, 1, encode);
    if (cipher == 'R') return new RotateStream({}, 8, encode);
  });

  const streamRead = input ? new ReadStream(input, 'utf8') : process.stdin;
  const streamWrite = output ? new WriteStream(output) : process.stdout;

  pipeline(streamRead, ...streamsCipher, streamWrite, (err) =>
    err ? errorHandler(err) : console.log('Ciphering was successful!'),
  );
} catch (e) {
  errorHandler(e);
}
