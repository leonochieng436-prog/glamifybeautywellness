import Image from "next/image";
import type { Brand } from "@/lib/brand";

export default function Logo({ brand, variant }: { brand: Brand; variant: "dark" }) {
  return brand.logoUrl ? (
    <Image
      src={brand.logoUrl}
      alt=""
      width={180}
      height={64}
      unoptimized
      className="max-h-14 w-auto object-contain"
    />
  ) : (
    <span className="font-display text-2xl font-semibold text-white">
      {brand.name}
    </span>
  );
}