import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");
  const result = await seedDatabase(prisma);
  console.log("Seeding complete!");
  console.log(`  - ${result.tags} tags`);
  console.log(`  - ${result.users} users`);
  console.log(`  - ${result.solutions} solutions`);
  console.log(`  - ${result.syncLogs} sync logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
