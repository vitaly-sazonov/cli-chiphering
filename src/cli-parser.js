const { ErrorParserArgv, ErrorParserConfig } = require('./errors');

class parserCLI {
  constructor() {
    this._validConfig = new Set(['C', 'R', 'A']);
    this.config = false;
    this.input = false;
    this.output = false;
  }

  run = (argv) => {
    const mapArgv = argv.slice(2).reduce((map, elem, ind, array) => {
      if (this._isKey(ind)) {
        const key = this._changeNameKeys(elem);
        this._checkRepeatKeys(map, key);
        const value = key === 'config' ? this._parseConfig(array[ind + 1]) : array[ind + 1];
        map.set(key, value);
      }
      return map;
    }, new Map());

    if (!mapArgv.has('config')) throw new ErrorParserArgv('No required keys "-c" or "-config"\n');

    this.config = mapArgv.get('config');
    this.input = mapArgv.get('input');
    this.output = mapArgv.get('output');

    return this;
  };

  _isKey = (index) => !(index % 2);

  _changeNameKeys = (key) => {
    if (key === '-c' || key === '--config') return 'config';
    if (key === '-i' || key === '--input') return 'input';
    if (key === '-o' || key === '--output') return 'output';

    throw new ErrorParserArgv(`Run command error! 
    Command format: node cli-cipherning -key1 "value1" -key2 "value2" ...
    Keys can be only "-c, -i, -o" or "--config, --input, --output"\n`);
  };

  _checkRepeatKeys = (map, key) => {
    if (map.has(key)) throw new ErrorParserArgv('Duplicate keys are not allowed\n');
  };

  _parseConfig = (str) => {
    const error = () => {
      throw new ErrorParserConfig(`The config must be in the format: "XY-...-XY-Z", where:
    X can be C, R;
    Y can be 0, 1;
    Z can be only A.\n`);
    };

    return str.split('-').reduce((acc, elem) => {
      if (elem.length == 0 || elem.length > 2) error(); // rule out example: XY--XY, XY-XY-, -XY
      if (!this._validConfig.has(elem[0])) error(); // only C,R,A
      if (elem[0] == 'A') {
        if (elem[1]) error(); // if A with numder, example: A1, A2
        acc.push([elem[0]]);
        return acc;
      }
      const num = parseInt(elem[1], 10);
      if (num !== 0 && num !== 1) error(); // only 0,1
      acc.push([elem[0], Boolean(num)]);
      return acc;
    }, []);
  };
}

module.exports = parserCLI;
