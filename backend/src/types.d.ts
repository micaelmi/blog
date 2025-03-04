import { JwtPayload } from "jsonwebtoken";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string;
      name: string;
      username: string;
      type: string;
      iat: number;
      exp: number;
    };
  }
}
