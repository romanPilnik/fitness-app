import type {
  Request,
  Response,
  NextFunction,
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler as ExpressErrorRequestHandler,
} from 'express';
import type { PaginationQuery } from './api.types.js';

interface RequestUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  preferences?: {
    units: 'metric' | 'imperial';
    weekStartsOn: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

interface RequestWithParams<P extends Record<string, string>> extends Request {
  params: P;
}

interface RequestWithQuery<Q extends Record<string, string | string[]>> extends Request {
  query: PaginationQuery & Q;
}

interface RequestWithBody<B> extends Request {
  body: B;
}

// Combined authenticated request types
interface AuthenticatedRequestWithBody<B> extends Request {
  user: RequestUser;
  body: B;
}

interface AuthenticatedRequestWithParams<P extends Record<string, string>> extends Request {
  user: RequestUser;
  params: P;
}

interface AuthenticatedRequestWithQuery<Q extends Record<string, string | string[]>>
  extends Request {
  user: RequestUser;
  query: PaginationQuery & Q;
}

interface AuthenticatedRequestWithParamsAndBody<P extends Record<string, string>, B>
  extends Request {
  user: RequestUser;
  params: P;
  body: B;
}

// Express handler type aliases
type RequestHandler<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[]>,
> = ExpressRequestHandler<P, ResBody, ReqBody, ReqQuery>;

type ErrorRequestHandler = ExpressErrorRequestHandler;

type AsyncRequestHandler<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[]>,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<void | Response<ResBody>>;

export type {
  RequestUser,
  AuthenticatedRequest,
  RequestWithParams,
  RequestWithQuery,
  RequestWithBody,
  AuthenticatedRequestWithBody,
  AuthenticatedRequestWithParams,
  AuthenticatedRequestWithQuery,
  AuthenticatedRequestWithParamsAndBody,
  RequestHandler,
  ErrorRequestHandler,
  AsyncRequestHandler,
};
