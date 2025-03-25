import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function createTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/tags",
    {
      schema: {
        summary: "Create tag",
        tags: ["tags"],
        body: z.object({
          name: z.string(),
        }),
        response: {
          201: z.object({
            id: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body;
      const tag = await prisma.tag.create({
        data: { name },
      });

      return reply.status(201).send({ id: tag.id });
    }
  );
}
