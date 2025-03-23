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
