import { PrismaClient } from "@prisma/client";
import { HERO_SLIDE_SEEDS } from "../src/lib/hero-slides";

const db = new PrismaClient();

async function main() {
  for (const [index, slide] of HERO_SLIDE_SEEDS.entries()) {
    const id = `seed-hero-${String(index + 1).padStart(2, "0")}`;
    await db.heroSlide.upsert({ where: { id }, update: slide, create: { id, ...slide } });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed hero slides:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
