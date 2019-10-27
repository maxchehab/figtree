import { NextApiRequest, NextApiResponse } from "next";

import { HttpException } from "../exceptions/http.exception";

type Route = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function Lambda(route: Route) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await route(req, res);
    } catch (error) {
      const { status = 500, message = error } = error as HttpException;

      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    }
  };
}
