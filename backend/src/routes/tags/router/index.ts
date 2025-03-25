import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createTag } from "../create";
import { deleteTag } from "../delete";
import { listAllTags } from "../list";
import { updateTag } from "../update";

export async function tagsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createTag);
  typedApp.register(listAllTags);
  typedApp.register(updateTag);
  typedApp.register(deleteTag);
}
