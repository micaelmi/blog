import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // create user types
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
  console.log("admin and common user types created");
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
