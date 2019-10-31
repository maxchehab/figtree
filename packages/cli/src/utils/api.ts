import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import chalk from 'chalk';

import { version } from '../../package.json';

type PollCallback = (response: AxiosResponse<any>) => boolean;

export class API {
  constructor(private readonly initialDoDebug: boolean = false) {
    this.doDebug = initialDoDebug;
    this.token = this.readToken();
  }

  private token: string | undefined;
  private doDebug: boolean;

  private toggleDebug(value: boolean) {
    this.doDebug = value;
  }

  setToken(token: string) {
    this.debug(`Updating token from '${this.token}' to '${token}'`);
    this.token = token;
  }

  writeToken(token: string) {
    const homedir = os.homedir();
    const figtreeDir = path.join(homedir, '.figtree');
    this.debug(`Checking if '${figtreeDir}' exists`);

    if (!fs.existsSync(figtreeDir)) {
      this.debug(`Path '${figtreeDir}' does not exist, creating`);
      fs.mkdirSync(figtreeDir);
    }

    const tokenPath = path.join(figtreeDir, 'token.json');
    const data = JSON.stringify({ token });
    this.debug(`Saving data '${data}' to '${tokenPath}'`);

    fs.writeFileSync(tokenPath, data);
  }

  readToken(): string | undefined {
    let token: string;

    const homedir = os.homedir();
    const tokenPath = path.join(homedir, '.figtree', 'token.json');
    this.debug(`Searching '${tokenPath}' for token`);

    if (!fs.existsSync(tokenPath)) {
      this.debug(`Path '${tokenPath}' does not exist`);
      return undefined;
    }

    this.debug(`Reading '${tokenPath}' for token`);

    try {
      const data = fs.readFileSync(tokenPath, 'utf8');
      token = JSON.parse(data).token;
      this.debug(`Parsed token '${this.token}'`);
    } catch (error) {
      this.debug(error);
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
    const url = `https://figtree.sh${path}`;
    this.debug('Polling', method, url);

    this.toggleDebug(false);

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

    this.toggleDebug(this.initialDoDebug);

    const { status, data } = response as AxiosResponse<any>;
    this.debug(status, JSON.stringify(data));
    this.debug('Completed polling', method, url);

    return response as AxiosResponse<any>;
  }

  async get(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<any>> {
    this.debug(`Using token '${this.token}'`);

    const url = `https://figtree.sh${path}`;

    try {
      this.debug('GET', url);

      const headers = config && config.headers;
      const response = await axios.get(url, {
        ...config,
        headers: {
          'User-Agent': `figtree-cli/v${version}`,
          'Authorization': `Bearer ${this.token}`,
          ...headers,
        },
      });

      const { status, data } = response;
      this.debug(status, JSON.stringify(data));

      return response;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.isAxiosError) {
        if (axiosError.response) {
          const { status, data } = axiosError.response;
          this.debug(status, JSON.stringify(data));
        }

        this.debug(axiosError.message);
      }

      throw error;
    }
  }

  debug(...args: any[]) {
    if (this.doDebug) {
      const debugArgs = ['>', new Date().toISOString(), ...args].map(arg =>
        chalk.dim(arg),
      );
      console.log(...debugArgs);
    }
  }
}
