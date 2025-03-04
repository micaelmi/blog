import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../env";

const secretKey = env.JWT_SECRET_KEY;

export const verifyToken = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return reply.status(401).send({ error: "Token not provided" });
    }

    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);

    if (typeof decoded === "string") {
      return reply.status(401).send({ error: "Invalid token" });
    }

    request.user = decoded as JwtPayload & {
      sub: string;
      name: string;
      username: string;
      type: string;
      iat: number;
      exp: number;
    };
  } catch (err: any) {
    console.error("Error on token validation:", err.message);
    return reply.status(401).send({ error: "Invalid token" });
  }
};
