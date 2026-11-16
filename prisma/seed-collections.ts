import { PrismaClient } from "@prisma/client";
import { COLLECTION_SEEDS } from "../src/lib/collections";

const db = new PrismaClient();

async function main() {
  for (const collection of COLLECTION_SEEDS) {
    await db.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed collections:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
