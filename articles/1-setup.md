# 🚀 How to set up a Node.js API with Fastity and Prisma

Building APIs with Node.js has never been more exciting—especially when you use a modern stack that emphasizes speed, type safety, and developer experience. In this post, I want to share my journey of setting up a Node API using Fastify for its blazing performance, Prisma for type-safe database access, and some other key tools that round out the experience.

### What I’m Using

Here’s a quick rundown of the main tools and libraries that power my project:

- _pnpm_ – My package manager of choice for efficient dependency handling.
- _Fastify_ – A lightweight and fast Node.js web framework.
- _Prisma_ – An ORM that not only makes querying databases type-safe but also improves productivity.
- _Swagger_ – To generate interactive API documentation.
- _Zod_ – For runtime validation and to assist with documentation via type definitions.
- _Docker_ – I use Docker to containerize the API (and even the Postgres database) so that my local environment remains clean and consistent.

---

## Getting Started with the Project

To start your project, follow these steps:

1. Initialize the Project
   The first thing to do is to create the project main folder, which I named `blog`, and inside it, create another folder named `backend`.
   After creating this folders, inside the backend folder, let's initialize the Node.js project using the pnpm init command.

```bash
pnpm init
```

This will generate a package.json file. You can then proceed to install the necessary dependencies.

> If you don't have pnpm on your computer, follow the installation guide in this link: [pnpm installation] (https://pnpm.io/installation).

### Install Dependencies

Run the following command to install the normal dependencies (libraries needed for the runtime):

```bash
pnpm add @fastify/cors @fastify/jwt @fastify/swagger @fastify/swagger-ui @prisma/client bcrypt dotenv fastify fastify-type-provider-zod helmet jsonwebtoken swagger-themes zod
```

To install the development dependencies (libraries needed for development, testing, etc.), run:

```bash
pnpm add -D @types/bcrypt @types/jsonwebtoken @types/node prisma ts-node tsup tsx typescript
```

### Dependency Breakdown

#### Normal Dependencies

1. **`@fastify/cors`**  
   A Fastify plugin to enable Cross-Origin Resource Sharing (CORS) for your API. This allows your server to respond to requests from different origins, which is essential for enabling client-side applications (on different domains) to communicate with your server.

2. **`@fastify/jwt`**  
   A Fastify plugin that provides JSON Web Token (JWT) support for authentication. It helps you create and verify JWTs, enabling secure token-based authentication in your API.

3. **`@fastify/swagger`**  
   A Fastify plugin to integrate [Swagger](https://swagger.io/), which is a tool for API documentation. It automatically generates and serves a Swagger UI to explore and interact with your API endpoints.

4. **`@fastify/swagger-ui`**  
   This plugin provides a UI for the Swagger documentation, enabling you to visualize and test your API endpoints directly from the browser.

5. **`@prisma/client`**  
   Prisma Client is an auto-generated query builder used to interact with your database. It provides a type-safe and easy-to-use API for querying and manipulating your database records.

6. **`bcrypt`**  
   A library to hash passwords securely. It helps to store user passwords in a safe, hashed format, preventing them from being exposed if the database is compromised.

7. **`dotenv`**  
   A library that loads environment variables from a `.env` file into `process.env`. This is useful for storing sensitive configuration settings, like database credentials, API keys, or other environment-specific variables.

8. **`fastify`**  
   The core framework that powers your API. Fastify is a fast and low-overhead web framework designed for building APIs with minimal performance impact.

9. **`fastify-type-provider-zod`**  
   A Fastify plugin that integrates [Zod](https://github.com/colinhacks/zod) (a TypeScript-first schema declaration and validation library) with Fastify, enabling you to enforce type safety in your route schemas and validations.

10. **`helmet`**  
    Helmet is a security middleware that helps secure your API by setting HTTP headers like Content Security Policy (CSP), X-Content-Type-Options, and others, which protect your app from some known web vulnerabilities.

11. **`jsonwebtoken`**  
    A library to create and verify JWTs. It's used for handling the creation and verification of tokens, which are typically used for authentication and session management.

12. **`swagger-themes`**  
    A library that provides customizable themes for the Swagger UI, giving you flexibility to style the API documentation to match your brand or personal preferences.

13. **`zod`**  
    A TypeScript-first schema validation library used for defining and validating data structures. It provides type safety for the input/output data of your API and integrates with Fastify via `fastify-type-provider-zod`.

#### Development Dependencies

1. **`@types/bcrypt`**  
   Provides TypeScript definitions for the `bcrypt` library, allowing TypeScript to understand the types used in the `bcrypt` library and provide type safety when using it.

2. **`@types/jsonwebtoken`**  
   Provides TypeScript definitions for the `jsonwebtoken` library, helping TypeScript understand its types and provide accurate type-checking for JWT operations.

3. **`@types/node`**  
   Provides TypeScript definitions for Node.js core modules like `fs`, `path`, `http`, and others. This ensures TypeScript understands the native Node.js APIs and offers type safety when interacting with them.

4. **`prisma`**  
   The Prisma CLI used for generating Prisma client, running database migrations, and managing your database schema. It helps to automate the setup of your database models and query the database.

5. **`ts-node`**  
   A TypeScript execution environment for Node.js. It allows you to run TypeScript files directly without needing to compile them manually. Great for development and testing.

6. **`tsup`**  
   A fast TypeScript bundler that compiles your code into a production-ready bundle. It's used here to bundle your TypeScript code before running it in production.

7. **`tsx`**  
   A tool that runs TypeScript files directly in Node.js without needing a compilation step. It's used here to run your TypeScript files in development mode.

8. **`typescript`**  
   The TypeScript language itself, enabling static typing and compilation from TypeScript to JavaScript, which improves developer productivity and code safety.

Each of these dependencies plays a critical role in making your Node.js API project fast, secure, type-safe, and easy to maintain. They help with everything from security (Helmet), to database interaction (Prisma), to development workflows (pnpm, TypeScript, and Prisma CLI), ensuring that you can scale and maintain your project efficiently. They will be used in the next steps.

---

## Setting Up the Database with Docker

Now that we've set up our project, it's time to create our database using Docker. In the root directory of your project ("`/blog`"), create a `docker-compose.yaml` file and paste the following configuration:

```yaml
version: "3.8"

services:
  blog-postgres-db:
    profiles: [dev, prod]
    image: bitnami/postgresql:14
    container_name: blog-postgres-db
    ports:
      - "5432:5432" # Expose PostgreSQL port for development (remove in production)
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${DATABASE_USERNAME:-docker}
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD:-docker}
      - POSTGRES_DB=${DATABASE_NAME:-blog}
    volumes:
      - blog_db_volume:/bitnami/postgresql # Persist database data in a Docker volume
    networks:
      - blog-network
    env_file:
      - .env # Load environment variables from the .env file

volumes:
  blog_db_volume:
    driver: local # Specify the volume driver for local persistence

networks:
  blog-network:
    driver: bridge # Use the bridge network for service communication
```

### Environment Variables

Next, create a `.env` file in the root directory to securely store your environment variables. This file will be used to configure the PostgreSQL database.

```env
DATABASE_USERNAME=docker
DATABASE_PASSWORD=docker
DATABASE_NAME=blog
```

### Running the Database with Docker

To spin up the database in development mode, run the following command:

```bash
docker compose --profile dev up -d
```

This will start the PostgreSQL container in the background, creating the database as defined in your `.env` file.

#### Notes:

- **Environment Variables**: We are using the `env_file` directive to load the environment variables from the `.env` file into the Docker container, making it easier to manage sensitive data securely.
- **Docker Image Versioning**: Instead of using the `latest` tag for the PostgreSQL image, it's recommended to pin the version (e.g., `bitnami/postgresql:14`) to ensure compatibility and prevent unexpected issues from future image updates.
- **Security in Production**: In production, you may want to remove the `ports` configuration to avoid exposing your database to the internet. It's also a good idea to restrict database access to only your API services using Docker networks.

This setup ensures a smooth transition from development to production, making it easier to manage the database and environment configuration securely.

---

## Configuring Prisma

With the database set up, it's time to configure Prisma ORM, define our schema, and establish a connection to the database container.

#### 1. Initialize Prisma

Run the following command to initialize Prisma in your project:

```bash
pnpm prisma init
```

> This command creates a folder named **`prisma`**, along with a **`schema.prisma`** file inside it. Additionally, a `.env` file will be generated containing the database connection URL.

Update the `.env` file with the correct connection string:

```env
DATABASE_URL="postgresql://docker:docker@localhost:5432/blog"
```

Now, Prisma should be able to connect to the database.

#### 2. Define Database Models

Inside the **`schema.prisma`** file, we can define the models that represent our database tables. Below is an example of a `User` model:

```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  username   String   @unique
  email      String   @unique
  password   String
  bio        String?
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

> In an upcoming chapter, I'll explain my database design process in more detail.

#### 3. Run the First Migration

With our first schema created, we can now run the following command to apply the changes to the database:

```bash
npx prisma migrate dev
```

> This command creates a migration file containing the SQL statements needed to set up the database schema. You will be prompted to name the migration—I called mine **"first migration"**, but you can choose any name that makes sense for your project.

Each migration is an incremental step that modifies the database structure while preserving data. Prisma tracks all migrations in a dedicated folder.

**⚠️ Important:**  
Never delete a migration file unless you intend to reset and recreate the entire database, as this could lead to data loss.

---

## Coding `server.ts`

The **`src/server.ts`** file is the core of our API, as it imports and initializes all essential functionalities.

### 1. Setting Up the Fastify App

First, we need to instantiate the Fastify app and define a `listen` function so that our API becomes accessible on a specified port:

```ts
import fastify from "fastify";

export const app = fastify();

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("Server running on port " + env.PORT);
});
```

The `env.PORT` value should be set in the same `.env` file we created while configuring Prisma. Add the following line:

```env
PORT=3333
```

However, instead of directly importing environment variables from `.env`, we can use **TypeScript with Zod** to create a **strongly typed and validated configuration model**.

### 2. Creating an `env.ts` Configuration File

Inside the `/src` folder, create a new file called **`env.ts`**, and define the environment variables as follows:

```ts
import { z } from "zod";
import { config } from "dotenv";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test", override: true });
} else {
  config();
}

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().min(1),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
```

This ensures that:

- All required environment variables are present.
- The `PORT` is always treated as a number.
- The `DATABASE_URL` follows a valid URL format.
- A default value is set for `NODE_ENV`.

Now, import `env.ts` inside `server.ts`:

```ts
import { env } from "./env";
```

This will eliminate potential errors related to missing or invalid environment variables.

---

## Adding Important Plugins

Below the `app` definition, we can register essential plugins, such as **CORS** and **Swagger** (with Zod integration) for API documentation:

```ts
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export const app = fastify();

const theme = new SwaggerTheme();
const content = theme.getBuffer(SwaggerThemeNameEnum.DARK); // Dark mode for Swagger UI

// Enable CORS to allow external connections to the API
app.register(cors, {
  origin: "*",
});

// Swagger documentation setup
app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "Blog API",
      description: "API for my blog project.",
      version: "1.0.0",
    },
  },
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
  theme: {
    css: [{ filename: "theme.css", content: content }],
  },
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// here's where our routes will be imported

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("Server running on port " + env.PORT);
});
```

Now, when your API is running, you can access the documentation at:

🔗 **[http://localhost:3333/docs](http://localhost:3333/docs)**

But to run the API, you need to follow the next step:

---

## 3. Setting Up Scripts in `package.json`

To easily manage and run our API, we define terminal commands inside the **`scripts`** section of `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsup src",
  "start": "node dist/server.js",
  "studio": "npx prisma studio",
  "migrate": "npx prisma migrate dev",
  "database:up": "docker compose --profile dev up -d",
  "database:stop": "docker compose --profile dev stop",
  "database:down": "docker compose --profile dev down"
}
```

### Running the API

With everything configured, start the API by running:

```bash
pnpm dev
```

If everything is set up correctly, you should see the following message in the terminal:

```
Server running on port 3333
```

Now, try opening **[http://localhost:3333/docs](http://localhost:3333/docs)** in your browser to view the Swagger documentation.

---

### ⏭️ Next Steps

In the next post, we will implement error handling, create our first routes and implement authentication using JWT.
Wait for it! See you soon 👋
