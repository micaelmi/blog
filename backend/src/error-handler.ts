import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "./errors/client-error";
import { BadRequest } from "./errors/bad-request";
import { ForbiddenError } from "./errors/forbidden-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.error("Erro capturado:", error);
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid Input",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  if (error instanceof BadRequest) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: "Internal Server Error",
    error: {
      message: error.message,
      stack: error.stack,
    },
  });
};
