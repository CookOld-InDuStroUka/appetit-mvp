declare module 'express' {
  export interface Request {
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    body?: unknown;
    headers: Record<string, string | string[] | undefined>;
  }

  export interface Response {
    json(body: unknown): Response;
    status(code: number): Response;
  }

  export interface Application {
    use(...handlers: any[]): void;
    get(path: string, handler: (req: Request, res: Response) => unknown): void;
    post(path: string, handler: (req: Request, res: Response) => unknown): void;
    listen(port: number, cb?: () => void): void;
  }

  export type NextFunction = () => void;

  export interface ExpressStatic {
    (): Application;
    json(): (req: Request, res: Response, next: NextFunction) => void;
  }

  const express: ExpressStatic;
  export default express;
}

declare module 'cors' {
  import type { Request, Response } from 'express';
  export type NextFunction = () => void;
  export default function cors(): (req: Request, res: Response, next: NextFunction) => void;
}
