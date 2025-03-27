import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";
import { listArticlesSchema } from "./schemas/article.schema";

export async function listAllArticles(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/articles",
    {
      schema: {
        summary: "List all the registered articles",
        tags: ["articles"],
        querystring: z.object({
          query: z.string().optional(),
          sortBy: z.enum(["createdAt", "updatedAt", "title"]).optional(),
          orderByDirection: z.enum(["asc", "desc"]).optional(),
          take: z.coerce.number().int().min(1).max(100).optional(),
          page: z.coerce.number().int().min(1).optional(),
        }),
        // response: {
        //   200: z.object({
        //     articles: z.array(listArticlesSchema),
        //   }),
        // },
      },
    },
    async (request, reply) => {
      const {
        query,
        sortBy = "createdAt",
        orderByDirection = "asc",
        take = 10,
        page = 1,
      } = request.query;

      const articles = await prisma.article.findMany({
        where: query ? { title: { contains: query } } : undefined,
        include: {
          tags: {
            select: {
              tag: true,
            },
          },
          author: {
            select: {
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { [sortBy]: orderByDirection },
        take,
        skip: (page - 1) * take,
      });

      return reply.send({ articles });
    }
  );
}
