import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function deleteUserType(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/user-types/:id",
    {
      schema: {
        summary: "Delete user type by id",
        tags: ["user types"],
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const userType = await prisma.userType.delete({
        where: { id },
      });

      return reply.send({ userType });
    }
  );
}
