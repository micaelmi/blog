import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createArticle } from "../create";
import { deleteArticle } from "../delete";
import { listAllArticles } from "../list";
import { updateArticle } from "../update";

export async function articlesRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createArticle);
  typedApp.register(listAllArticles);
  typedApp.register(updateArticle);
  typedApp.register(deleteArticle);
}
