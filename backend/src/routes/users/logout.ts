import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function logout(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users/logout",
    {
      schema: {
        summary: "User Logout",
        tags: ["users"],
      },
    },
    async (_request, reply) => {
      return reply
        .clearCookie("auth_token", { path: "/", httpOnly: true, secure: true })
        .status(200)
        .send({ message: "Logged out successfully" });
    }
  );
}
