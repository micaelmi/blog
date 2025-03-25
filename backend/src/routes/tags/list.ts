import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function listAllTags(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/tags",
    {
      schema: {
        summary: "List all the registered tags",
        tags: ["tags"],
        response: {
          200: z.object({
            tags: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (_, reply) => {
      const tags = await prisma.tag.findMany({
        orderBy: { name: "asc" },
      });
      return reply.send({ tags });
    }
  );
}
