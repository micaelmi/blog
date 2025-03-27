import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function deleteArticle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/articles/:id",
    {
      schema: {
        summary: "Delete article by id",
        articles: ["articles"],
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const article = await prisma.article.delete({
        where: { id },
      });

      return reply.send({ article });
    }
  );
}
