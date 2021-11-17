const { errorHandler, ErrorStream, ErrorParserArgv, ErrorParserConfig } = require('../src/errors');
const parserCLI = require('../src/cli-parser');

describe('Test class cli-parser', () => {
  let parseFn;

  beforeEach(() => {
    parseFn = (cmd) => {
      const arrayArgv = cmd.split(' ');
      const arrayArgvWithoutMarks = arrayArgv.map((item) => item.replace(/"|'/g, ''));
      return new parserCLI().run(arrayArgvWithoutMarks);
    };
  });

  test('if the config matches the declaration, then a parsed array is returned', () => {
    const { config } = parseFn(`node cli-ciphering -c "C1-C1-R0-A"`);
    const configToString = JSON.stringify(config);
    const configExpect = JSON.stringify([['C', true], ['C', true], ['R', false], ['A']]);
    expect(Array.isArray(config)).toBe(true);
    expect(configToString).toBe(configExpect);
  });

  test('The -i (or -o) flag is specified - returns the input property with the path to the file as a string, the flag is absent - the property is false', () => {
    let parse = parseFn(`node cli-ciphering -c "C1-C1-R0-A" -i "./input.txt"`);
    expect(parse.input).toBe('./input.txt');
    expect(parse.output).toBeUndefined();
    parse = parseFn(`node cli-ciphering -c "C1-C1-R0-A" -o "./output.txt"`);
    expect(parse.output).toBe('./output.txt');
    expect(parse.input).toBeUndefined();
  });

  test('if there is a duplicate key in the config, then a custom error is thrown', () => {
    expect(() => parseFn(`node cli-ciphering -c "C1-C1-R0-A" -c "C1-C1-R0-A"`)).toThrow(ErrorParserArgv);
  });

  test('if the config is missing, then a custom error "ErrorParserArgv" is thrown', () => {
    expect(() => parseFn(`node cli-ciphering`)).toThrow(ErrorParserArgv);
  });

  test('if keys other than -i, -o, -c (or -input, -output, -config) are present, then a custom error "ErrorParserArgv" is thrown', () => {
    expect(() => parseFn(`node cli-ciphering -out`)).toThrow(ErrorParserArgv);
    expect(() => parseFn(`node cli-ciphering --in`)).toThrow(ErrorParserArgv);
    expect(() => parseFn(`node cli-ciphering --test`)).toThrow(ErrorParserArgv);
  });

  test('if the config has syntax errors, then a custom error "ErrorParserConfig" is thrown', () => {
    expect(() => parseFn(`node cli-ciphering -c "C-C1-R0-A"`)).toThrow(ErrorParserConfig);
    expect(() => parseFn(`node cli-ciphering -c "C3-C1-R0-A"`)).toThrow(ErrorParserConfig);
    expect(() => parseFn(`node cli-ciphering -c "-C1-R0-A"`)).toThrow(ErrorParserConfig);
    expect(() => parseFn(`node cli-ciphering -c "C1-R0-A0"`)).toThrow(ErrorParserConfig);
    expect(() => parseFn(`node cli-ciphering -c "C1-R0-A-"`)).toThrow(ErrorParserConfig);
    expect(() => parseFn(`node cli-ciphering -c "C1-R0-A-D"`)).toThrow(ErrorParserConfig);
  });
});
