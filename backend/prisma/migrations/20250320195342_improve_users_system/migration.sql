/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `user_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "unconfirmed_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "user_type" TEXT NOT NULL DEFAULT 'common',
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unconfirmed_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unconfirmed_users_username_key" ON "unconfirmed_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "unconfirmed_users_email_key" ON "unconfirmed_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_types_type_key" ON "user_types"("type");
