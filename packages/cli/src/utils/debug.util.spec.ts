import { debug } from './debug.util';
import * as CLI from 'cli-flags';
import stripAnsi from 'strip-ansi';

describe('debug', () => {
  let log: any;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('with no debug parameter', () => {
    beforeEach(() => {
      jest.spyOn(CLI, 'parse').mockImplementation(
        () =>
          ({
            flags: { debug: false } as CLI.OutputFlags,
          } as CLI.ParserOutput),
      );

      debug('hello world');
    });

    it('does not log', () => {
      expect(log).not.toBeCalled();
    });
  });

  describe('with debug parameter', () => {
    beforeEach(() => {
      jest.spyOn(CLI, 'parse').mockImplementation(
        () =>
          ({
            flags: { debug: true } as CLI.OutputFlags,
          } as CLI.ParserOutput),
      );

      debug('hello world');
    });

    it('does log', () => {
      expect(log).toBeCalledTimes(1);

      const params = log.mock.calls[0].map((param: any) => stripAnsi(param));
      expect(params[0]).toEqual('>');
      expect(Date.parse(params[1])).not.toBeNaN();
      expect(params[2]).toEqual('hello world');
    });
  });
});
