import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function listAllUserTypes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/user-types",
    {
      schema: {
        summary: "List all the registered user types",
        tags: ["user types"],
        response: {
          200: z.object({
            userTypes: z.array(
              z.object({
                id: z.string(),
                type: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (_, reply) => {
      const userTypes = await prisma.userType.findMany({
        orderBy: { type: "asc" },
      });
      return reply.send({ userTypes });
    }
  );
}
