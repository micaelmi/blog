import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        summary: "Create account",
        tags: ["users"],
        body: z.object({
          name: z.string(),
          username: z.string().min(4),
          email: z.string().email(),
          password: z.string().min(8).max(32),
          bio: z.string().optional(),
          userTypeId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { name, username, email, password, bio, userTypeId } = request.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          bio,
          userTypeId,
        },
      });

      return reply.status(201).send({ userId: user.id });
    }
  );
}
