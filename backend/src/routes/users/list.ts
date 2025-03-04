import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";

export async function listAllUsers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        summary: "List all the registered users",
        tags: ["users"],
      },
    },
    async (request, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          bio: true,
          createdAt: true,
          userType: {
            select: {
              type: true,
            },
          },
        },
      });
      return reply.send({ users: users });
    }
  );
}
