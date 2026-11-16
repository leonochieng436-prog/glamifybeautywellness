"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingWhatsAppButton({ href }: { href: string }) {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (footerVisible) return null;

  return (
    <a
      data-whatsapp
      aria-label="Chat on WhatsApp"
      href={href}
      className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center bg-primary p-3 text-white shadow-lg hover:bg-primary-dark sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3"
    >
      <MessageCircle size={20} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">WhatsApp us</span>
    </a>
  );
}
