import { Lambda } from "../common/util/lambda.util";

export default Lambda(async (_req, res) => res.status(200).send("fuckenv"));
