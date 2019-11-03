import { apiResolver } from 'next-server/dist/server/api-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';

type Route = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export default function createTestLambda(route: Route) {
  return http.createServer((req: any, res: any) =>
    apiResolver(req, res, undefined, route),
  );
}
