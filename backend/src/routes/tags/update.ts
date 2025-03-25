import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function updateTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/tags/:id",
    {
      schema: {
        summary: "Update tag",
        tags: ["tags"],
        params: z.object({
          id: z.number(),
        }),
        body: z.object({
          name: z.string(),
        }),
        response: {
          200: z.object({
            id: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const tag = await prisma.tag.update({
        where: { id },
        data: { ...request.body },
      });

      return reply.status(200).send({ id: tag.id });
    }
  );
}
