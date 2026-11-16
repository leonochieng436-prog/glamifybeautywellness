CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_CollectionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToProduct_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE INDEX "Collection_position_idx" ON "Collection"("position");
CREATE INDEX "_CollectionToProduct_B_index" ON "_CollectionToProduct"("B");

ALTER TABLE "_CollectionToProduct"
    ADD CONSTRAINT "_CollectionToProduct_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Collection"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CollectionToProduct"
    ADD CONSTRAINT "_CollectionToProduct_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
