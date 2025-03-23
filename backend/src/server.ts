import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { env } from "./env";
import { errorHandler } from "./error-handler";
import { verifyToken } from "./middlewares/verify-token";
import { userTypeRoutes } from "./routes/user-types";
import { userPublicRoutes, userRoutes } from "./routes/users/router";

export const app = fastify();

const theme = new SwaggerTheme();
const content = theme.getBuffer(SwaggerThemeNameEnum.DARK);

app.register(cors, {
  origin: "*",
});

app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "Blog API",
      description: "API for my blog project.",
      version: "1.0.0",
    },
    securityDefinitions: {
      BearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    security: [{ BearerAuth: [] }],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
  theme: {
    css: [{ filename: "theme.css", content: content }],
  },
});

app.register(fastifyCookie, {
  hook: "onRequest",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

app.register(userPublicRoutes);

// authenticated routes
app.register(async (app) => {
  app.addHook("preHandler", verifyToken);
  app.register(userRoutes);
  app.register(userTypeRoutes);
});

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("Server running on port " + env.PORT);
});
