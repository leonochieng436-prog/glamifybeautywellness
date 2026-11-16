"use client";

import { Menu } from "lucide-react";
import { useEffect } from "react";

export default function MobileNav({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-controls="admin-sidebar"
        aria-expanded={open}
        onClick={onOpen}
        className="grid h-11 w-11 shrink-0 place-items-center border border-line text-ink hover:border-primary hover:text-primary lg:hidden"
      >
        <Menu size={20} />
      </button>
      {open && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
    </>
  );
}
