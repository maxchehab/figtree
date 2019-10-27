export class HttpException {
  constructor(readonly status: number, readonly message: string) {}
}
