declare module 'express' {
  export type Request = any;
  export type Response = any;
  const e: any;
  export default e;
}
declare module 'cors' {
  const c: any;
  export default c;
}
declare module 'jsonwebtoken' {
  export function sign(...args: any[]): any;
}
declare var process: any;
declare module '@prisma/client' {
  export class PrismaClient {
    [key: string]: any;
  }
  export enum OrderStatus {
    created,
    accepted,
    cooking,
    delivering,
    done,
    canceled,
  }
  export enum OrderType {
    delivery,
    pickup
  }
}
