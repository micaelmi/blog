import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { confirmEmail } from "../confirm-email";
import { createUnconfirmedUser } from "../create-unconfirmed-user";
import { deleteUser } from "../delete";
import { listAllUsers } from "../list";
import { login } from "../login";
import { updateUser } from "../update";
import { logout } from "../logout";

export async function userPublicRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createUnconfirmedUser);
  typedApp.register(confirmEmail);
  typedApp.register(login);
}

export async function userRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(listAllUsers);
  typedApp.register(updateUser);
  typedApp.register(deleteUser);
  typedApp.register(logout);
}
