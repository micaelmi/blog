import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function updateUserType(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/user-types/:id",
    {
      schema: {
        summary: "Update user type",
        tags: ["user types"],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          type: z.string(),
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

      const userType = await prisma.userType.update({
        where: { id },
        data: { ...request.body },
      });

      return reply.send({ id: userType.id });
    }
  );
}
