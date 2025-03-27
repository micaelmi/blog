import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function updateUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/users/:userId",
    {
      schema: {
        summary: "Update user",
        tags: ["users"],
        params: z.object({
          userId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().optional(),
          username: z.string().min(4).optional(),
          email: z.string().email().optional(),
          password: z.string().min(8).max(32).optional(),
          bio: z.string().optional().optional(),
          userTypeId: z.string().uuid().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      let { password } = request.body;

      if (password) {
        password = await bcrypt.hash(password, 10);
      }
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...request.body,
          password,
        },
      });

      return reply.status(200).send({ id: user.id });
    }
  );
}
