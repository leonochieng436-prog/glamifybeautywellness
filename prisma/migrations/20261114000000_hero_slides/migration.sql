CREATE TYPE "HeroSlideTheme" AS ENUM ('BLUE', 'BLACK', 'LIGHT');

CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "theme" "HeroSlideTheme" NOT NULL DEFAULT 'BLUE',
    "eyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "chips" JSONB NOT NULL,
    "stats" JSONB,
    "primaryLabel" TEXT NOT NULL,
    "primaryHref" TEXT NOT NULL,
    "secondaryLabel" TEXT NOT NULL,
    "secondaryHref" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HeroSlide_active_position_idx" ON "HeroSlide"("active", "position");
