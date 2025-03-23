# 🔒 Secure Your Sign-Ups: Email Validation in Node.js with Fastify, Prisma, and Nodemailer 📧

When building an authentication system, one crucial feature to implement is **email validation** before creating a user account. In this article, I'll show you how to implement this process using **Fastify**, **Prisma**, and **Nodemailer** to ensure that a user cannot register with someone else's email—whether by accident or on purpose.

The approach follows these steps:

1. Register the user data in a temporary table (unconfirmed users)
2. Send an email with a confirmation button
3. Confirm the email by clicking the button
4. Create the official user account
5. Delete temporary user data
6. Send a success email
7. Redirect the user

---

## 💾 Setting Up Data Structures

First, let's create our **Prisma Schema**:

```ts
model User {
  id         String   @id @default(uuid())
  name       String
  username   String   @unique
  email      String   @unique
  password   String   @db.VarChar(255)
  bio        String?
  createdAt  DateTime @default(now()) @map("created_at")
  userTypeId String   @map("user_type_id")
  userType   UserType @relation(fields: [userTypeId], references: [id])

  @@map("users")
}

model UnconfirmedUser {
  id         String   @id @default(uuid())
  name       String
  username   String   @unique
  email      String   @unique
  password   String   @db.VarChar(255)
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("unconfirmed_users")
}

model UserType {
  id    String @id @default(uuid())
  type  String @unique
  users User[]

  @@map("user_types")
}
```

These three tables are all you need for a full authentication system.

For the user types, create a `seed.ts` file inside the `/prisma` folder that automatically creates the user types you'll need:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create user types
  const commonUser = await prisma.userType.findFirst({
    where: { type: "common" },
  });
  if (!commonUser) {
    await prisma.userType.create({
      data: { type: "common" },
    });
  }
  const adminUser = await prisma.userType.findFirst({
    where: { type: "admin" },
  });
  if (!adminUser) {
    await prisma.userType.create({
      data: { type: "admin" },
    });
  }
  console.log("Admin and common user types created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

To run the seed function, simply execute:

```bash
npx prisma db seed
```

> **Note:** The seed function can create any data you need. In this example, it just creates two user types.

If you're struggling with setting up the Node.js application, check out these articles:

- [🚀 How to Set Up a Node.js API with Fastify and Prisma](https://dev.to/micaelmi/setting-up-a-nodejs-api-90j)
- [🛠️ How to Build Routes in a Node.js API with Fastify and Prisma](https://dev.to/micaelmi/how-to-build-routes-in-a-nodejs-api-with-fastify-and-prisma-5gd7)

---

## 📝 Create Unconfirmed User

Now that the configuration is set, let's create the route. Inside the `/users` folder, create a file named `create-unconfirmed-user.ts` and paste the following code:

```ts
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { ClientError } from "../../errors/client-error"; // Optional: you can switch to the default Error if preferred
import { prisma } from "../../lib/prisma"; // Setup as described in the recommended articles

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

      // Create temporary user
      const user = await prisma.unconfirmedUser.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
        },
      });

      return reply.send({ message: "ok" });
    }
  );
}
```

**Actions required:**

1. Install dependencies (check [my package.json](https://github.com/micaelmi/blog/blob/main/backend/package.json) for reference).
2. Ensure your database is up to date.
3. Register this route in `server.ts`.

> This route validates if the username and email are available, encrypts the password, and creates the unconfirmed user data.

---

## ✉️ Send Confirmation Email

Now, we'll set up email sending with **Nodemailer**.

**Install the library:**

```bash
pnpm i nodemailer
```

**Create a mail client in test mode:**

```ts
// src/lib/nodemailer.ts
import nodemailer from "nodemailer";

export async function getMailClient() {
  const account = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  return transporter;
}
```

**Create the email object with HTML content:**

```ts
// src/lib/emails/confirmation-email.ts
export const confirmationEmail = (
  name: string,
  email: string,
  apiBaseUrl: string,
  userId: string
) => {
  return {
    from: {
      name: "Micael",
      address: "test@test.com",
    },
    to: {
      name: name,
      address: email,
    },
    subject: `Confirm your email to Micael's blog!`,
    html: `
      <div
        style="
          font-family: sans-serif;
          max-width: 400px;
          margin: 2rem auto;
          padding: 1rem;
          border-radius: 0.5rem;
        "
      >
        <h2>Welcome to Micael's Blog!</h2>
        <p style="padding: 1rem 0; line-height: 2rem">
          Click the link below to confirm your account creation.
        </p>
        <a
          href="${apiBaseUrl}/users/confirm-email?user_id=${userId}"
          style="
            text-decoration: none;
            background-color: #161f30;
            color: white;
            padding: 0.5rem 2rem;
            border-radius: 0.3rem;
            font-weight: bold;
          "
        >
          Confirm my email
        </a>
        <p style="padding: 1rem 0; line-height: 2rem; font-size: 14px">
          If you didn't register, please ignore this email.
        </p>
        <a href="#" target="_blank" style="color: black"> Micael's Blog </a>
      </div>
    `.trim(),
  };
};
```

> **Tip:** You can design the email in an HTML file and then paste the code into this function.

Now, let's call this email function inside `create-unconfirmed-user.ts`:

**Import the dependencies:**

```ts
import nodemailer from "nodemailer";
import { env } from "../../env";
import { getMailClient } from "../../lib/nodemailer";
import { confirmationEmail } from "../../lib/emails/confirmation-email";
```

**Trigger the email at the end of the file:**

```ts
// Send confirmation email
const userFirstName = name.split(" ")[0];
const apiBaseUrl = env.API_BASE_URL;
const mail = await getMailClient();
const message = await mail.sendMail(
  confirmationEmail(userFirstName, email, apiBaseUrl, user.id)
);
console.log(nodemailer.getTestMessageUrl(message));

return reply
  .status(202)
  .send({ message: "Confirmation email was sent successfully" });
```

> **Notes:**
>
> - The confirmation email is sent using Nodemailer's native `sendMail` method.
> - The API base URL is obtained from your `.env` file, though you could also use a string (e.g., `"http://localhost:3333"`) for testing.
> - The console log prints a URL to preview the email.
> - A status code `202` is returned to indicate the email was accepted for processing.

---

## 🧪 Test the Email

After setting everything up, test the route. You should see a link in the terminal that lets you preview the email. The confirmation button won't work yet — this will be implemented in the next step.

![Example of email on Ehtereal test server](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/og1pvaquwhwhceowpbfk.png)

> Example of how it should look like

---

## 👤 Create the User Account

When the user clicks the confirmation link, the API route validates the email and uses the `user_id` query parameter to create the user account. To improve security, the account creation should only proceed if it’s been less than 15 minutes since registration, based on the `createdAt` attribute of the unconfirmed user.

### Separate the User Creation Function

```ts
// src/routes/users/create-account.ts
import { UnconfirmedUser } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export default async function createAccount(existingUser: UnconfirmedUser) {
  const userType = await prisma.userType.findFirst({
    where: { type: "common" },
  });

  if (!userType) {
    throw new Error("User type 'common' not found.");
  }

  const user = await prisma.user.create({
    data: {
      name: existingUser.name,
      username: existingUser.username,
      email: existingUser.email,
      password: existingUser.password,
      userTypeId: userType.id,
    },
  });

  return user;
}
```

This function receives the unconfirmed user data, retrieves the `common` user type, and creates the official user record.

### Create the API Route

```ts
// src/routes/users/confirm-email.ts
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

      // Check if registration is within 15 minutes
      if (
        dayjs(existingUser.createdAt).isBefore(dayjs().subtract(15, "minute"))
      ) {
        await prisma.unconfirmedUser.delete({
          where: { id: existingUser.id },
        });
        throw new ClientError("Registration expired, please try again");
      }

      const user = await createAccount(existingUser);

      await prisma.unconfirmedUser.delete({
        where: { id: existingUser.id },
      });

      const name = user.name.split(" ")[0];
      const mail = await getMailClient();
      // create another email function for success, just like the previous one
      const message = await mail.sendMail(successEmail(name, user.email));
      console.log(nodemailer.getTestMessageUrl(message));

      return reply.status(201).send({ userId: user.id });
      // Alternatively, you can redirect the user:
      // return reply.redirect(`${env.FRONTEND_BASE_URL}/success_page`);
    }
  );
}
```

> **Summary of Changes in This Step:**
>
> 1. Validates the `user_id` from the query parameters.
> 2. Checks if the confirmation is within 15 minutes of registration and deletes the temporary data if expired.
> 3. Creates the official user account.
> 4. Deletes the unconfirmed user data.
> 5. Sends a success email and returns the new user ID.
> 6. Includes commented-out code as an alternative to redirect the user if you have a frontend.

---

## 📚 Conclusion

This article demonstrates a simple yet effective user registration system using Fastify, Prisma, and Nodemailer. By validating emails before creating an account, you enhance the security of your application without the need for many external services.

If you found this strategy helpful, please like and comment. Let me know what topic you'd like to see next!

✌️ For the complete source code, visit my repository: [Blog by micaelmi](https://github.com/micaelmi/blog/tree/main/backend)
