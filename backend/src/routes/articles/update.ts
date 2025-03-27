import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function updateArticle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/articles/:id",
    {
      schema: {
        summary: "Update article",
        tags: ["articles"],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().optional(),
          imageUrl: z.string().url().optional(),
          content: z.string().optional(),
          published: z.boolean().optional(),
          tagIds: z.array(z.number()).optional(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { title, imageUrl, content, published, tagIds } = request.body;

      const article = await prisma.article.update({
        where: { id },
        data: { title, imageUrl, content, published },
      });

      if (tagIds && tagIds.length > 0) {
        const previousTags = await prisma.articleTag.findMany({
          where: { articleId: id },
        });
        // delete registered tags not included in the new tags list
        const tagsToDelete = previousTags.filter(
          (tag) => !tagIds.includes(tag.tagId)
        );
        await prisma.articleTag.deleteMany({
          where: {
            id: {
              in: tagsToDelete.map((tag) => tag.id),
            },
          },
        });
        // create new tags
        const previousTagIds = new Set(previousTags.map((item) => item.tagId));
        const tagsToCreate = tagIds.filter((tag) => !previousTagIds.has(tag));
        await prisma.articleTag.createMany({
          data: tagsToCreate.map((tagId) => ({ articleId: id, tagId })),
        });
      } else {
        // delete all article tags if no one is provided
        await prisma.articleTag.deleteMany({
          where: { articleId: id },
        });
      }

      return reply.status(200).send({ id: article.id });
    }
  );
}
