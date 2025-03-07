A crucial part of almost every system is a secure authentication mechanism. In this post, we'll implement authentication in a Node.js API built with Fastify. The creation of the API and the first routes related to the user table have already been covered in my previous posts — [Check it out here](https://dev.to/micaelmi/how-to-build-routes-in-a-nodejs-api-with-fastify-and-prisma-5gd7). The base code is available in this GitHub repository: [Blog - by micaelmi](https://github.com/micaelmi/blog).

## Creating a Login Route

To start the authentication process, we need to create a login route where the user will obtain an access token to use in protected routes. Inside `src/routes/users`, create `login.ts`:

```ts
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import jwt from "jsonwebtoken";
import z from "zod";
import { env } from "../../env";
import { ClientError } from "../../errors/client-error";
import { prisma } from "../../lib/prisma";

export async function login(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users/login",
    {
      schema: {
        summary: "User Login",
        tags: ["users"],
        body: z.object({
          credential: z.string().min(4), // username or email
          password: z.string().min(8).max(32),
        }),
      },
    },
    async (request, reply) => {
      const { credential, password } = request.body;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: credential }, { email: credential }],
        },
      });

      if (!user) throw new ClientError("User does not exist");

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) throw new ClientError("Password does not match");

      const secretJwtKey = env.JWT_SECRET_KEY;
      const expirationTime = "30d";

      const token = jwt.sign(
        {
          sub: user.id,
          name: user.name,
          username: user.username,
          type: user.userTypeId,
        },
        secretJwtKey,
        { expiresIn: expirationTime }
      );

      return reply.send({ token });
    }
  );
}
```

### Explanation:

1. Search for a user in the database using the provided username or email.
2. Compare the provided password with the stored hashed password using bcrypt.
3. Create a JWT token containing relevant user data from the database.
4. Send the generated token back to the user.

Now, register the route in `server.ts`:

```ts
app.register(login);
```

Test it in Swagger UI. The expected response should look like this:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

You can inspect the token's payload on the [JWT Website](https://jwt.io/).

## Creating a Middleware to Verify Token Validity

Now we need to create a middleware — a function that runs between the request and response cycle, processing requests before they reach the final handler. This middleware ensures that only authenticated users can access protected routes.

```ts
import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../env";

const secretKey = env.JWT_SECRET_KEY;

export const verifyToken = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return reply.status(401).send({ error: "Token not provided" });
    }

    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);

    if (typeof decoded === "string") {
      return reply.status(401).send({ error: "Invalid token" });
    }

    request.user = decoded as JwtPayload & {
      sub: string;
      name: string;
      username: string;
      type: string;
      iat: number;
      exp: number;
    };
  } catch (err: any) {
    console.error("Error on token validation:", err.message);
    return reply.status(401).send({ error: "Invalid token" });
  }
};
```

This function:

- Ensures a token is provided.
- Verifies the token's validity.
- Stores the decoded user data in `request.user` for later use.

## Applying the Middleware and Testing Route Protection

To enforce authentication, add a `preHandler` hook in `server.ts`:

```ts
app.register(async (app) => {
  app.addHook("preHandler", verifyToken);
  // Protected routes go here
});
```

Now, test a protected route without a token. The response should be:

```json
{
  "error": "Token not provided"
}
```

To enable token authentication in Swagger UI, update `fastifySwagger` configuration, adding the following code right after the `info` object:

```ts
//...
info: {
  title: "Blog API",
  description: "API for my blog project.",
  version: "1.0.0",
}, // ⬇️⬇️⬇️
securityDefinitions: {
  BearerAuth: {
    type: "apiKey",
    name: "Authorization",
    in: "header",
    description: "Enter your JWT token in the format: Bearer <token>",
  },
},
security: [{ BearerAuth: [] }],
// ...
```

A new "Authorize" button will appear. Click it and enter your token in the following format:

```bash
Bearer <your-token>
```

> **Note:** Don't forget to include "Bearer" before the token.

After authorization, protected routes will be accessible.

## Conclusion

Now we have a simple but effective authentication system that allows public and protected routes in the API. If anything seems off, check out the project repository: [Blog - by micaelmi](https://github.com/micaelmi/blog).

Further improvements could include role-based access control (RBAC) to set different permissions for different users or another user-type validation process. But for now, we have a fully functional authentication system.
