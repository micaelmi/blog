import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function deleteTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/tags/:id",
    {
      schema: {
        summary: "Delete tag by id",
        tags: ["tags"],
        params: z.object({
          id: z.number(),
        }),
        response: {
          200: z.object({
            tag: z.object({
              id: z.number(),
              name: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const tag = await prisma.tag.delete({
        where: { id },
      });

      return reply.send({ tag });
    }
  );
}
