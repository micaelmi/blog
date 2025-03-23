import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { ClientError } from "../../errors/client-error";
import { prisma } from "../../lib/prisma";
import nodemailer from "nodemailer";
import { env } from "../../env";
import { getMailClient } from "../../lib/nodemailer";
import { ConfirmationEmail } from "../../lib/emails/confirmation-email";

export async function createUnconfirmedUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        summary: "Create unconfirmed user and send confirmation email",
        tags: ["users"],
        body: z.object({
          name: z.string().min(4),
          username: z.string().min(4),
          email: z.string().email(),
          password: z.string().min(8).max(32),
        }),
      },
    },
    async (request, reply) => {
      const { name, username, email, password } = request.body;

      const existingUsername = await prisma.user.findFirst({
        select: { id: true },
        where: { username },
      });
      const existingEmail = await prisma.user.findFirst({
        select: { id: true },
        where: { email },
      });

      if (existingUsername) throw new ClientError("Username already in use");

      if (existingEmail) throw new ClientError("Email already in use");

      const hashedPassword = await bcrypt.hash(password, 10);

      // create temporary user
      const user = await prisma.unconfirmedUser.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
        },
      });

      // send confirmation email
      const userFirstName = name.split(" ")[0];
      const apiBaseUrl = env.API_BASE_URL;
      const mail = await getMailClient();
      const message = await mail.sendMail(
        ConfirmationEmail(userFirstName, email, apiBaseUrl, user.id)
      );
      console.log(nodemailer.getTestMessageUrl(message));

      return reply
        .status(202)
        .send({ message: "Confirmation email was sent successfully" });
    }
  );
}
