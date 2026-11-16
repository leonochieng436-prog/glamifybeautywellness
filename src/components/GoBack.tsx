"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GoBack() {
  const router = useRouter();

  return <button type="button" onClick={() => {
    if (window.history.length > 1) router.back();
    else router.push("/shop");
  }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
    <ArrowLeft size={16} aria-hidden="true" />
    Go back
  </button>;
}
