import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createUserType } from "../create";
import { deleteUserType } from "../delete";
import { listAllUserTypes } from "../list";
import { updateUserType } from "../update";

export async function userTypeRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createUserType);
  typedApp.register(listAllUserTypes);
  typedApp.register(updateUserType);
  typedApp.register(deleteUserType);
}
