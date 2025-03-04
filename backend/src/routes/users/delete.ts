import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function deleteUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/users/:userId",
    {
      schema: {
        summary: "Delete user by id",
        tags: ["users"],
        params: z.object({
          userId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      const user = await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return reply.send({ user });
    }
  );
}
