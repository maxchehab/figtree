import { ExprVal } from 'faunadb';

export interface FaunaEntity<t> {
  ref: ExprVal;
  data: t;
}
