import dayjs from "dayjs";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { env } from "../../env";
import { ClientError } from "../../errors/client-error";
import { successEmail } from "../../lib/emails/success-email";
import { getMailClient } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
import createAccount from "./create-account";
import { successPage } from "../../lib/views/success-page";

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
        dayjs(existingUser.createdAt).isBefore(dayjs().subtract(15, "minute"))
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

      const name = user.name.split(" ")[0];
      const mail = await getMailClient();
      const message = await mail.sendMail(successEmail(name, user.email));
      console.log(nodemailer.getTestMessageUrl(message));

      // return reply.redirect(`${env.FRONTEND_BASE_URL}/success`);
      return reply.header("Content-Type", "text/html").send(successPage);
    }
  );
}
