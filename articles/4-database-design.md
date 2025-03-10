# 🔎 From Concept to Schema: How I Design Databases

There are many different ways to design databases, but with some practice, we develop our own approach that seems to work well. In this article, I'll share my process for designing databases. While these methods may need to be adjusted for large-scale projects, in my (not very extensive) experience, the following steps will help you create a functional database model.

## 📝 Step 0: Defining System Requirements

It's crucial to have a clear understanding of how the software should work, with every functionality defined before properly creating your database. This process will prevent mistakes such as missing tables or fields or incorrectly relating tables. One of the first things we learn in software engineering is **requirement analysis**—the process of gathering, defining, and validating the needs and constraints of a software system to ensure it meets user expectations and business goals.

You can simply list the functionalities if they are clear in your mind, but if they are still vague, designing a prototype can help a lot. With a visual model of your prototype, you can identify requirements that weren't included in your initial list.

---

## 📂 Step 1: Defining the Database Tables

With your requirements carefully defined, it won't be hard to identify the necessary tables. In this step, you'll need to think ahead about the relationships between tables. This will help you identify secondary tables and even "connector tables" (used in many-to-many relationships). Make a list of all the tables and proceed to the next step.

---

## 📊 Step 2: Creating the Entity-Relationship Diagram (ERD)

There are many tools available for creating ERDs. Here, I'm using a free one called [DB Designer](https://www.dbdesigner.net/). After choosing your tool, create all the tables and start defining the table fields.

### 🔑 2.1 - Primary Keys

All tables must have a **primary key (ID)**, which can be defined as a **string (UUID or other unique identifier method)** or **integer (auto-increment)**. Each approach has its pros and cons, so you need to analyze what is more important for your case:

- Use **UUID** for more security.
- Use **integer** for more speed and simplicity.

> **Note:** The same database can use different ID methods for different tables.

### 📌 2.2 - Normal Data Fields

Implement all the necessary fields in the tables and define their types and sizes.

**Tip:** Some commonly used attributes in databases include:

- `created_at (datetime)`: Automatically stores the date and time of record creation.
- `updated_at (datetime)`: Stores the last modification timestamp.
- `status (boolean)`: Used to determine whether the data is active/inactive, resolved/unresolved, etc.

### 🔗 2.3 - Foreign Keys (Relationships)

To establish relationships between tables, create **foreign keys** and associate them with the corresponding primary keys. Understanding the type of relationship between tables is crucial to defining these keys correctly:

- **One-to-One**: Consider merging the two tables if appropriate.
- **One-to-Many** / **Many-to-One**: Indicates which table references the other.
- **Many-to-Many**: Requires a **connector table** to manage the relationship.

### 🏷️ 2.4 - Standardizing Naming Conventions

Maintaining a consistent naming convention in your database makes it easier to remember and maintain. Here are some best practices:

- Use **lowercase** for all names.
- Use **`snake_case`** (`_` instead of spaces).
- Use **plural** names for tables.
- Name **primary keys** as `id`.
- Name **foreign keys** as `table_name_id`.

### 🔍 2.5 - Reviewing the Results

Here's an example of a database model after applying these steps:

![Entity-Relationship Diagram Example](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pwe3xelsszf250a4ym0g.png)

With this visual model, review the requirements and check if everything looks correct.

> **Note:** In this example, two different ID types were used: `varchar` (UUID) and `integer` (auto-increment).

---

## 🏗️ Step 3: Generating the Database

DB Designer automatically generates an SQL script that can be used to create your database. Since we have AI tools to make our work easier, I copied the "Markup code" from the modeling tool and asked ChatGPT to generate a database script based on it.

The following is an example of a database script written for **Prisma ORM**:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String   @id @default(uuid())
  name       String
  username   String   @unique
  email      String   @unique
  password   String
  bio        String?
  createdAt  DateTime @default(now()) @map("created_at")
  userTypeId String   @map("user_type_id")
  userType   UserType @relation(fields: [userTypeId], references: [id])

  articles  Article[]
  comments  Comment[]
  feedbacks Feedback[]

  @@map("users")
}

model UserType {
  id    String @id @default(uuid())
  type  String
  users User[]

  @@map("user_types")
}

model Tag {
  id       Int          @id @default(autoincrement())
  name     String       @unique
  articles ArticleTag[]

  @@map("tags")
}

model Article {
  id        String   @id @default(uuid())
  title     String
  imageUrl  String   @map("image_url")
  content   String
  status    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")
  author    User     @relation(fields: [userId], references: [id])

  tags     ArticleTag[]
  comments Comment[]

  @@map("articles")
}

model ArticleTag {
  id        Int    @id @default(autoincrement())
  articleId String @map("article_id")
  tagId     Int    @map("tag_id")

  article Article @relation(fields: [articleId], references: [id])
  tag     Tag     @relation(fields: [tagId], references: [id])

  @@unique([articleId, tagId])
  @@map("article_tags")
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")
  articleId String   @map("article_id")

  author  User    @relation(fields: [userId], references: [id])
  article Article @relation(fields: [articleId], references: [id])

  @@map("comments")
}

model Feedback {
  id        String   @id @default(uuid())
  title     String
  message   String
  createdAt DateTime @default(now()) @map("created_at")
  userId    String   @map("user_id")

  user User @relation(fields: [userId], references: [id])

  @@map("feedbacks")
}

model EmailList {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  status    Boolean

  @@map("email_list")
}

```

> **Notes:**
>
> 1. I asked GPT to use the `@map` and `@@map` decorators to rename tables and fields following the **snake_case** convention in database generation.
> 2. For **string IDs**, the default was **UUID**. For **integer IDs**, the default was **auto-increment**.

After reviewing everything, you can generate your database!

---

## 🎯 Conclusion

Now we have a fully designed database, built using these simple steps! This method can be a great way to structure your database in many cases, especially for small projects. In your next project, consider these steps and share how you design your databases!
