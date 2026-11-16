import crypto from "crypto";
export async function uploadImage(f: File, folder: "products" | "hero-slides" = "products") {
  if (!["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 4_000_000) throw new Error("Images must be JPG, PNG or WebP, under 4 MB.");
  const { CLOUDINARY_CLOUD_NAME: c, CLOUDINARY_API_KEY: k, CLOUDINARY_API_SECRET: s } = process.env;
  if (!c || !k || !s) throw new Error("Cloudinary is not configured. Set the CLOUDINARY_* variables.");
  const ts = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${ts}${s}`).digest("hex");
  const body = new FormData(); body.set("file", f); body.set("api_key", k); body.set("timestamp", ts); body.set("folder", folder); body.set("signature", signature);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${c}/image/upload`, { method: "POST", body }); const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message ?? "Upload failed"); return j.secure_url as string;
}
