import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";

export async function listAllUserTypes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/user-types",
    {
      schema: {
        summary: "List all the registered user types",
        tags: ["user types"],
      },
    },
    async (request, reply) => {
      const userTypes = await prisma.userType.findMany();
      return reply.send({ userTypes: userTypes });
    }
  );
}
