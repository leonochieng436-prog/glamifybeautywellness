"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MAX_FILE_SIZE = 750 * 1024;
const MAX_ROWS = 500;
const headers = [
  "name",
  "slug",
  "categorySlug",
  "shortDescription",
  "description",
  "priceKes",
  "discountPriceKes",
  "stock",
  "ingredients",
  "directions",
  "imageUrl",
  "featured",
  "bestSeller",
  "archived",
  "collectionSlugs",
] as const;
const requiredHeaders = ["name", "slug", "categorySlug", "shortDescription", "description", "priceKes", "stock"];

export type ProductImportState = {
  error?: string;
  created?: number;
  rowErrors?: string[];
};

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let quoteClosed = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
          quoteClosed = true;
        }
      } else {
        cell += character;
      }
    } else if (quoteClosed && (character === " " || character === "\t")) {
      continue;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
      quoteClosed = false;
    } else if (character === "\n" || character === "\r") {
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
      quoteClosed = false;
      if (character === "\r" && input[index + 1] === "\n") index += 1;
    } else if (character === '"') {
      if (cell.length !== 0 || quoteClosed) throw new Error("The CSV contains a misplaced quote.");
      quoted = true;
    } else {
      if (quoteClosed) throw new Error("The CSV contains characters after a quoted field.");
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

const optionalText = (limit: number) => z.string().trim().max(limit);
const numericCell = (minimum: number, maximum: number) =>
  z.string().regex(/^\d+$/, "Enter a whole number.").transform(Number).pipe(
    z.number().int().min(minimum).max(maximum),
  );
const productRowSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  categorySlug: z.string().trim().toLowerCase().min(2).max(80),
  shortDescription: z.string().trim().min(3).max(500),
  description: z.string().trim().min(3).max(5000),
  priceKes: numericCell(1, 100000000),
  discountPriceKes: z.union([z.literal(""), numericCell(1, 100000000)]).transform((value) => value === "" ? null : value),
  stock: numericCell(0, 10000000),
  ingredients: optionalText(5000),
  directions: optionalText(5000),
  imageUrl: z.union([z.literal(""), z.string().url().max(2048)]).transform((value) => value || null),
  featured: z.enum(["true", "false"]).transform((value) => value === "true"),
  bestSeller: z.enum(["true", "false"]).transform((value) => value === "true"),
  archived: z.enum(["true", "false"]).transform((value) => value === "true"),
  collectionSlugs: z.string().trim().max(1000),
}).superRefine((row, context) => {
  if (row.discountPriceKes !== null && row.discountPriceKes >= row.priceKes) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["discountPriceKes"], message: "Must be less than priceKes." });
  }
});

export async function importProducts(
  _state: ProductImportState,
  formData: FormData,
): Promise<ProductImportState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to import." };
  if (!file.name.toLowerCase().endsWith(".csv")) return { error: "Upload a .csv file." };
  if (file.size > MAX_FILE_SIZE) return { error: "The CSV must be 750 KB or smaller." };

  let rows: string[][];
  try {
    rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The CSV could not be read." };
  }
  if (rows.length < 2) return { error: "The CSV must include a header row and at least one product." };

  const columnNames = rows[0].map((header) => header.trim());
  const duplicateHeaders = columnNames.filter((header, index) => columnNames.indexOf(header) !== index);
  const knownHeaders = new Set<string>(headers);
  const unknownHeaders = columnNames.filter((header) => !knownHeaders.has(header));
  const missingHeaders = requiredHeaders.filter((header) => !columnNames.includes(header));
  if (duplicateHeaders.length || unknownHeaders.length || missingHeaders.length) {
    return {
      error: [
        duplicateHeaders.length ? `Duplicate columns: ${[...new Set(duplicateHeaders)].join(", ")}.` : "",
        unknownHeaders.length ? `Unknown columns: ${[...new Set(unknownHeaders)].join(", ")}.` : "",
        missingHeaders.length ? `Missing required columns: ${missingHeaders.join(", ")}.` : "",
      ].filter(Boolean).join(" "),
    };
  }

  const productRows = rows.slice(1);
  if (productRows.length > MAX_ROWS) return { error: `Import up to ${MAX_ROWS} products at a time.` };

  const errors: string[] = [];
  const parsedRows: z.infer<typeof productRowSchema>[] = [];
  const slugs = new Set<string>();
  for (const [index, cells] of productRows.entries()) {
    if (cells.length > columnNames.length) {
      errors.push(`Row ${index + 2}: has more values than the header.`);
      continue;
    }
    const values = Object.fromEntries(columnNames.map((header, column) => [header, cells[column] ?? ""]));
    const parsed = productRowSchema.safeParse({
      name: values.name ?? "",
      slug: values.slug ?? "",
      categorySlug: values.categorySlug ?? "",
      shortDescription: values.shortDescription ?? "",
      description: values.description ?? "",
      priceKes: values.priceKes ?? "",
      discountPriceKes: values.discountPriceKes ?? "",
      stock: values.stock ?? "",
      ingredients: values.ingredients ?? "",
      directions: values.directions ?? "",
      imageUrl: values.imageUrl ?? "",
      featured: (values.featured || "false").trim().toLowerCase(),
      bestSeller: (values.bestSeller || "false").trim().toLowerCase(),
      archived: (values.archived || "false").trim().toLowerCase(),
      collectionSlugs: values.collectionSlugs ?? "",
    });
    if (!parsed.success) {
      errors.push(`Row ${index + 2}: ${parsed.error.issues.map((issue) => `${issue.path.join(".") || "row"} ${issue.message}`).join("; ")}`);
      continue;
    }
    if (slugs.has(parsed.data.slug)) errors.push(`Row ${index + 2}: duplicate slug "${parsed.data.slug}" in this file.`);
    slugs.add(parsed.data.slug);
    parsedRows.push(parsed.data);
  }
  if (errors.length) return { error: "No products were imported. Fix the following rows and upload the file again.", rowErrors: errors.slice(0, 20) };

  const [categories, collections, existing] = await Promise.all([
    db.productCategory.findMany({ select: { id: true, slug: true } }),
    db.collection.findMany({ select: { id: true, slug: true } }),
    db.product.findMany({ where: { slug: { in: [...slugs] } }, select: { slug: true } }),
  ]);
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
  const collectionIds = new Map(collections.map((collection) => [collection.slug, collection.id]));
  const existingSlugs = new Set(existing.map((product) => product.slug));

  for (const [index, product] of parsedRows.entries()) {
    if (!categoryIds.has(product.categorySlug)) errors.push(`Row ${index + 2}: categorySlug "${product.categorySlug}" does not match an existing category.`);
    if (existingSlugs.has(product.slug)) errors.push(`Row ${index + 2}: slug "${product.slug}" already exists.`);
    const requestedCollections = product.collectionSlugs.split("|").map((slug) => slug.trim()).filter(Boolean);
    for (const slug of requestedCollections) {
      if (!collectionIds.has(slug)) errors.push(`Row ${index + 2}: collection slug "${slug}" does not exist.`);
    }
  }
  if (errors.length) return { error: "No products were imported. Fix the following rows and upload the file again.", rowErrors: errors.slice(0, 20) };

  await db.$transaction(async (transaction) => {
    for (const product of parsedRows) {
      const collectionSlugs = [...new Set(product.collectionSlugs.split("|").map((slug) => slug.trim()).filter(Boolean))];
      await transaction.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          categoryId: categoryIds.get(product.categorySlug)!,
          shortDescription: product.shortDescription,
          description: product.description,
          ingredients: product.ingredients || null,
          directions: product.directions || null,
          priceKes: product.priceKes,
          discountPriceKes: product.discountPriceKes,
          isFeatured: product.featured,
          isBestSeller: product.bestSeller,
          isArchived: product.archived,
          collections: { connect: collectionSlugs.map((slug) => ({ id: collectionIds.get(slug)! })) },
          images: product.imageUrl ? { create: { url: product.imageUrl, alt: product.name } } : undefined,
          inventory: {
            create: {
              quantity: product.stock,
              movements: product.stock > 0 ? { create: { type: "RESTOCK", change: product.stock, note: "Bulk product import" } } : undefined,
            },
          },
        },
      });
    }
  });

  revalidatePath("/", "layout");
  return { created: parsedRows.length };
}
