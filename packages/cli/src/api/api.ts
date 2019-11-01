import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { APIOptions } from './api-options.interface';
import { debug } from '../utils/debug.util';

type PollCallback = (response: AxiosResponse<any>) => boolean;

export class API {
  constructor(private readonly options: APIOptions) {
    debug('Initalizing API with options', JSON.stringify(options));
    this.token = this.readToken();
  }

  private token: string | undefined;

  setToken(token: string) {
    debug(`Updating token from '${this.token}' to '${token}'`);
    this.token = token;
  }

  writeToken(token: string) {
    const homedir = os.homedir();
    const figtreeDir = path.join(homedir, '.figtree');
    debug(`Checking if '${figtreeDir}' exists`);

    if (!fs.existsSync(figtreeDir)) {
      debug(`Path '${figtreeDir}' does not exist, creating`);
      fs.mkdirSync(figtreeDir);
    }

    const tokenPath = path.join(figtreeDir, 'token.json');
    const data = JSON.stringify({ token });
    debug(`Saving data '${data}' to '${tokenPath}'`);

    fs.writeFileSync(tokenPath, data);
  }

  readToken(): string | undefined {
    let token: string;

    const homedir = os.homedir();
    const tokenPath = path.join(homedir, '.figtree', 'token.json');
    debug(`Searching '${tokenPath}' for token`);

    if (!fs.existsSync(tokenPath)) {
      debug(`Path '${tokenPath}' does not exist`);
      return undefined;
    }

    debug(`Reading '${tokenPath}' for token`);

    try {
      const data = fs.readFileSync(tokenPath, 'utf8');
      token = JSON.parse(data).token;
      debug(`Parsed token '${this.token}'`);
    } catch (error) {
      debug(error);
      return undefined;
    }

    return token;
  }

  async poll(
    callback: PollCallback,
    method: 'GET',
    path: string,
    config?: AxiosRequestConfig,
  ) {
    const url = `${this.options.apiURL}${path}`;
    debug('Polling', method, url);

    let response: AxiosResponse<any> | undefined = undefined;

    do {
      try {
        response = await this.get(path, config);
      } catch (error) {
        const axiosError = error as AxiosError<any>;

        if (axiosError.isAxiosError) {
          response = axiosError.response;
        }
      }
    } while (response && !callback(response));

    const { status, data } = response as AxiosResponse<any>;
    debug(status, JSON.stringify(data));
    debug('Completed polling', method, url);

    return response as AxiosResponse<any>;
  }

  async get(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<any>> {
    debug(`Using token '${this.token}'`);

    const url = `${this.options.apiURL}${path}`;

    try {
      debug('GET', url);

      const headers = config && config.headers;
      const response = await axios.get(url, {
        ...config,
        headers: {
          'User-Agent': this.options.userAgent,
          'Authorization': `Bearer ${this.token}`,
          ...headers,
        },
      });

      const { status, data } = response;
      debug(status, JSON.stringify(data));

      return response;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.isAxiosError) {
        if (axiosError.response) {
          const { status, data } = axiosError.response;
          debug(status, JSON.stringify(data));
        }

        debug(axiosError.message);
      }

      throw error;
    }
  }
}
