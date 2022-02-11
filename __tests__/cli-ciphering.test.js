const { spawn } = require('child_process');
const { constants } = require('../__mocks__/fs');

describe('Testing CLI: RED Test', () => {
  const cmd = (argv, errorMsg, done) => {
    const child = spawn('node', ['cli-ciphering.js', ...argv]);

    child.stderr.on('data', (data) => {
      const error = data.toString('utf8').trim();
      expect(error).toBe(errorMsg);
    });
    child.on('exit', (code) => {
      expect(code).toBe(1);
      done();
    });
  };

  test('Input: node cli-ciphering.js -c "C1-C0" -c "A", result: "ErrorParserArgv: Duplicate keys are not allowed"', (done) => {
    cmd(['-c', 'C1-C0', '-c', 'A'], 'ErrorParserArgv: Duplicate keys are not allowed', done);
  });

  test('Input: node cli-ciphering.js, result: "ErrorParserArgv: No required keys "-c" or "-config""', (done) => {
    cmd([], 'ErrorParserArgv: No required keys "-c" or "-config"', done);
  });

  test('Input: node cli-ciphering.js -c "C1-C0" -i "./nonfile", result: "ErrorStream: no such directory or file "./nonfile""', (done) => {
    cmd(
      ['-c', 'C1-C0', '-i', './nonfile'],
      'ErrorStream: no such directory or file "./nonfile"',
      done,
    );
  });

  test('Input: node cli-ciphering.js -c "C1-C0" -i "./nonfile", result: "ErrorStream: no such directory or file "./nonfile""', (done) => {
    cmd(
      ['-c', 'C1-C0', '-i', './nonfile'],
      'ErrorStream: no such directory or file "./nonfile"',
      done,
    );
  });

  test('Input: node cli-ciphering.js -c "C1-C0" -o "./nonfile", result: "ErrorStream: no such file or directory "./nonfile""', (done) => {
    cmd(
      ['-c', 'C1-C0', '-o', './nonfile'],
      'ErrorStream: no such file or directory "./nonfile"',
      done,
    );
  });

  test('Input: node cli-ciphering.js -c "AAA"", result: "ErrorParserConfig: The config must be in the format: "XY-...-XY-Z", where: ..."', (done) => {
    cmd(
      ['-c', 'AAA'],
      `ErrorParserConfig: The config must be in the format: "XY-...-XY-Z", where:
    X can be C, R;
    Y can be 0, 1;
    Z can be only A.`,
      done,
    );
  });
});

describe('Testing CLI: GREEN Test', () => {
  const cmd = (argv, inputText, outputText, done) => {
    const child = spawn('node', ['cli-ciphering.js', ...argv]);

    child.stdout.on('data', (data) => {
      const string = data.toString('utf8').trim();
      expect(string).toBe(outputText);
    });

    child.stdin.end(inputText);

    child.on('exit', (code) => {
      expect(code).toBe(0);
      done();
    });
  };

  test('config: "C1-C1-R0-A" -> test passed', (done) => {
    cmd(
      ['-c', 'C1-C1-R0-A'],
      'This is secret. Message about "_" symbol!',
      'Myxn xn nbdobm. Tbnnfzb ferlm "_" nhteru!',
      done,
    );
  });

  test('config: "C1-C0-A-R1-R0-A-R0-R0-C1-A" -> test passed', (done) => {
    cmd(
      ['-c', 'C1-C0-A-R1-R0-A-R0-R0-C1-A'],
      'This is secret. Message about "_" symbol!',
      'Vhgw gw wkmxkv. Ckwwoik onauv "_" wqcnad!',
      done,
    );
  });

  test('config: "A-A-A-R1-R0-R0-R0-C1-C1-A" -> test passed', (done) => {
    cmd(
      ['-c', 'A-A-A-R1-R0-R0-R0-C1-C1-A'],
      'This is secret. Message about "_" symbol!',
      'Hvwg wg gsqfsh. Asggous opcih "_" gmapcz!',
      done,
    );
  });

  test('config: "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -> test passed', (done) => {
    cmd(
      ['-c', 'C1-R1-C0-C0-A-R0-R1-R1-A-C1'],
      'This is secret. Message about "_" symbol!',
      'This is secret. Message about "_" symbol!',
      done,
    );
  });
});
