import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAccount } from "./create";
import { deleteUser } from "./delete";
import { listAllUsers } from "./list";
import { updateUser } from "./update";

export async function userRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createAccount);
  typedApp.register(listAllUsers);
  typedApp.register(updateUser);
  typedApp.register(deleteUser);
}
