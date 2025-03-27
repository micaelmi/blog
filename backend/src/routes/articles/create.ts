import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function createArticle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/articles",
    {
      schema: {
        summary: "Create article",
        articles: ["articles"],
        body: z.object({
          title: z.string(),
          imageUrl: z.string().url(),
          content: z.string(),
          published: z.boolean().optional(),
          tagIds: z.array(z.number()),
        }),
      },
    },
    async (request, reply) => {
      const { title, imageUrl, content, published, tagIds } = request.body;
      const userId = request.user.sub;
      const article = await prisma.article.create({
        data: {
          title,
          imageUrl,
          content,
          userId,
          published,
          tags: {
            createMany: {
              data: tagIds.map((id) => ({ tagId: id })),
            },
          },
        },
      });

      return reply.status(201).send({ id: article.id });
    }
  );
}
