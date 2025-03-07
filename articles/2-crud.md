# 🛠️ How to Build Routes in a Node.js API with Fastify and Prisma

Continuing from the previous post [🚀 How to Set Up a Node.js API with Fastify and Prisma](https://dev.to/micaelmi/setting-up-a-nodejs-api-90j), let's now code our first route.

## Setting Up the Prisma Client

First, we need to create a Prisma client that will be used to interact with our database. Inside the `/src/lib` directory, create a file named `prisma.ts` and add the following code:

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

## Organizing Routes

Next, create a folder named `routes` inside `/src`. Within `/routes`, create another folder named `users`, where we'll store all user-related functions.

Our first file inside this folder will be **`create.ts`**. The required imports for this file are:

```ts
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma"; // our newly defined client
```

Apart from `bcrypt`, all our routes will import these core libraries from Fastify, Zod and Prisma.

## Defining the Route

The function definition includes the HTTP route path, some documentation details, and a Zod-typed schema for input validation. Here’s how it looks:

```ts
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
        }),
      },
    },
    async (request, reply) => {
      // The next part will be placed here
    }
  );
}
```

Zod provides powerful tools for defining validation rules, ensuring our API only accepts correctly formatted data.

## Implementing the Route Logic

Inside the function, we need to retrieve the request data, hash the password, and store the user in the database:

```ts
const { name, username, email, password, bio } = request.body;

const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
  data: {
    name,
    username,
    email,
    password: hashedPassword,
    bio,
  },
});

return reply.status(201).send({ userId: user.id });
```

## Registering the Route in the Server

Now that our route is created, we need to import it into `server.ts` so it can be used.

At the beginning of the `server.ts` file, add:

```ts
import { createAccount } from "./routes/users/create";
```

Then, register the route before the `app.listen` call:

```ts
app.register(createAccount);
```

Now, reload the [Swagger page](http://localhost:3333/docs) and the route should be automatically indexed. Besides the documentation, you can also test your route by clicking on the **"Try out"** button and editing the body. If you followed the steps correctly, your route should be working!

---

## Building the Route to List Users

To list all registered users, create a new file named `list.ts` inside the `/src/routes/users` folder and add the following code:

```ts
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";

export async function listAllUsers(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        summary: "List all the registered users",
        tags: ["users"],
      },
    },
    async (request, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          bio: true,
          createdAt: true,
        },
      });
      return reply.send({ users });
    }
  );
}
```

> **Note:**  
> The schema here is similar to the one for creating an account, but simpler. We use Prisma’s `findMany()` method with the `select` option to retrieve only specific fields from the database. You can adjust this to filter or format data as needed.

Register this route in your `server.ts` and test it on the Swagger UI.

---

## Updating a User

Next, create a file named `update.ts` in the same folder (`/src/routes/users`) with the following code:

```ts
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
          bio: z.string().optional(),
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
          password, // will be undefined if not provided
        },
      });

      return reply.status(200).send({ userId: user.id });
    }
  );
}
```

### Key Points:

1. **HTTP Method & URL Params:**  
   We use the PUT method and include a URL parameter (`:userId`), which is validated by Zod in the `params` schema.
2. **Optional Fields:**  
   All fields in the body are optional since the user might update only a subset of the fields.
3. **Password Encryption:**  
   If a new password is provided, it is hashed before updating the record.
4. **Spread Operator:**  
   The spread operator (`...request.body`) is used to pass all the fields, with the exception of password which is handled separately.

Register this route in your `server.ts` and test it via Swagger.

---

## Deleting a User

Finally, to complete the CRUD operations, create a file named `delete.ts` in the `/src/routes/users` folder with the following code:

```ts
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function deleteUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/users/:userId",
    {
      schema: {
        summary: "Delete user by id",
        tags: ["users"],
        params: z.object({
          userId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      const user = await prisma.user.delete({
        where: { id: userId },
      });

      return reply.send({ user });
    }
  );
}
```

> **Note:**  
> This route follows the same pattern as the others—the only difference being the HTTP DELETE method. Register it in your server and test it on Swagger.

---

## Improving the Imports with a Route Index File

As your `server.ts` file grows, importing every route individually can make it look messy. To improve organization, create an `index.ts` file inside the `/src/routes/users` folder:

```ts
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAccount } from "./create";
import { listAllUsers } from "./list";
import { updateUser } from "./update";
import { deleteUser } from "./delete";

export async function userRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  typedApp.register(createAccount);
  typedApp.register(listAllUsers);
  typedApp.register(updateUser);
  typedApp.register(deleteUser);
}
```

Now, in your `server.ts`, instead of registering each route separately, import and register the consolidated `userRoutes` function:

```ts
import { userRoutes } from "./routes/users";

app.register(userRoutes);
```

This setup helps keep your code organized and your `server.ts` file clean.

---

With all these routes in place and registered, your API now supports creating, listing, updating, and deleting users. Test all the routes via the Swagger UI at [http://localhost:3333/docs](http://localhost:3333/docs).

---

## Conclusion

Now we have implemented the most important features, covering the CRUD functions and some best practices. However, there are many possible improvements that can be made in upcoming versions. Follow the updates here and in the project repository: [GitHub - micaelmi/blog](https://github.com/micaelmi/blog).Next step is to implement authentication and route protection, stay tuned!
