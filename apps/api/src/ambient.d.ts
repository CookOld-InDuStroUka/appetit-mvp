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
declare var process: any;
declare module '@prisma/client' {
  export class PrismaClient {
    [key: string]: any;
  }
  export enum OrderStatus {
    created,
    paid,
    completed,
    cancelled
  }
  export enum OrderType {
    delivery,
    pickup
  }
}
