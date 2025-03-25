import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function createUserType(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/user-types",
    {
      schema: {
        summary: "Create user type",
        tags: ["user types"],
        body: z.object({
          type: z.string(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { type } = request.body;
      const userType = await prisma.userType.create({
        data: { type },
      });

      return reply.status(201).send({ id: userType.id });
    }
  );
}
