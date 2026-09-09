import "dotenv/config";

import bcrypt from "bcryptjs";
import prisma from "../src/config/database";

const users = [
  {
    name: "System Admin",
    email: "admin@mini-erp.com",
    password: "Admin@123",
    role: "ADMIN" as const,
  },
  {
    name: "Sales User",
    email: "sales@mini-erp.com",
    password: "Sales@123",
    role: "SALES" as const,
  },
  {
    name: "Warehouse User",
    email: "warehouse@mini-erp.com",
    password: "Warehouse@123",
    role: "WAREHOUSE" as const,
  },
  {
    name: "Accounts User",
    email: "accounts@mini-erp.com",
    password: "Accounts@123",
    role: "ACCOUNTS" as const,
  },
];

async function main() {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log("Test users seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });