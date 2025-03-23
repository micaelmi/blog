import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { env } from "../../env";
import { ClientError } from "../../errors/client-error";
import { dayjs } from "../../lib/dayjs";
import { prisma } from "../../lib/prisma";
import createAccount from "./create-account";

export async function confirmEmail(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/confirm-email",
    {
      schema: {
        summary: "Confirm user email and create user account",
        tags: ["users"],
        querystring: z.object({
          user_id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { user_id } = request.query;

      const existingUser = await prisma.unconfirmedUser.findFirst({
        where: { id: user_id },
      });

      if (!existingUser) throw new ClientError("User does not exist");

      if (
        dayjs(existingUser.created_at).isBefore(dayjs().subtract(15, "minute"))
      ) {
        await prisma.unconfirmedUser.delete({
          where: { id: existingUser.id },
        });
        throw new ClientError("Register expired, please try again");
      }

      const user = await createAccount(existingUser);

      await prisma.unconfirmedUser.delete({
        where: { id: existingUser.id },
      });

      // return reply.redirect(
      //   `${env.FRONTEND_BASE_URL}/register/confirm-email?userId=${user.id}&status=confirmed`
      // );
      return reply.status(201).send({ userId: user.id });
    }
  );
}
