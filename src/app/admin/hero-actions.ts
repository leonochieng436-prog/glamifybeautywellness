"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  heroThemeSchema,
  type HeroActionState,
} from "@/lib/hero-slides";
import { z } from "zod";

const internalHref = z.string().trim().min(1).max(512).refine(
  (value) => value.startsWith("/") && !value.startsWith("//"),
  "Use an internal path such as /shop.",
);
const secondaryHref = z.union([
  internalHref,
  z.string().trim().url().max(512).refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use an internal path or HTTPS URL."),
]);

const slideSchema = z.object({
  position: z.coerce.number().int().min(0).max(1000),
  theme: heroThemeSchema,
  eyebrow: z.string().trim().min(2).max(100),
  headline: z.string().trim().min(4).max(140),
  primaryLabel: z.string().trim().min(2).max(60),
  primaryHref: internalHref,
  secondaryLabel: z.string().trim().min(2).max(60),
  secondaryHref,
});

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveHeroSlide(
  id: string,
  _previousState: HeroActionState,
  formData: FormData,
): Promise<HeroActionState> {
  await requireAdmin();
  const backgroundFile = formData.get("backgroundImage");
  if (
    backgroundFile instanceof File &&
    backgroundFile.size > 0 &&
    (!["image/jpeg", "image/png", "image/webp"].includes(backgroundFile.type) || backgroundFile.size > 4_000_000)
  ) {
    return {
      error: "Review the highlighted fields and try again.",
      fieldErrors: { backgroundImage: "Choose a JPG, PNG or WebP image under 4 MB." },
    };
  }

  const parsed = slideSchema.safeParse({
    position: readString(formData, "position"),
    theme: readString(formData, "theme"),
    eyebrow: readString(formData, "eyebrow"),
    headline: readString(formData, "headline"),
    primaryLabel: readString(formData, "primaryLabel"),
    primaryHref: readString(formData, "primaryHref"),
    secondaryLabel: readString(formData, "secondaryLabel"),
    secondaryHref: readString(formData, "secondaryHref"),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
        messages?.[0] ? [[field, messages[0]]] : [],
      ),
    );
    return { error: "Review the highlighted fields and try again.", fieldErrors };
  }

  const existing = id === "new"
    ? null
    : await db.heroSlide.findUniqueOrThrow({ where: { id }, select: { backgroundImageUrl: true } });
  const uploadedImage = backgroundFile instanceof File && backgroundFile.size > 0
    ? await uploadImage(backgroundFile, "hero-slides")
    : null;
  const data = {
    ...parsed.data,
    backgroundImageUrl: uploadedImage ?? (formData.has("removeBackgroundImage") ? null : existing?.backgroundImageUrl ?? null),
    active: formData.has("active"),
  };
  if (id === "new") await db.heroSlide.create({ data });
  else await db.heroSlide.update({ where: { id }, data });

  revalidatePath("/", "layout");
  revalidatePath("/admin/content/hero-slides");
  redirect("/admin/content/hero-slides?saved=slide");
}

export async function deleteHeroSlide(id: string) {
  await requireAdmin();
  await db.heroSlide.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/content/hero-slides");
  redirect("/admin/content/hero-slides?saved=deleted");
}
