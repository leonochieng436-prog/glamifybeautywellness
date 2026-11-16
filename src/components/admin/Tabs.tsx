"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Tabs({ tabs, initialActive }: { tabs: { label: string; href: string }[]; initialActive: string }) {
  const [active, setActive] = useState(initialActive);

  useEffect(() => {
    const updateActive = () => setActive(window.location.hash || initialActive);
    updateActive();
    window.addEventListener("hashchange", updateActive);
    return () => window.removeEventListener("hashchange", updateActive);
  }, [initialActive]);

  return (
    <nav aria-label="Page sections" className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? "page" : undefined}
          onClick={() => setActive(tab.href)}
          className={`inline-flex min-h-11 items-center border-b-2 px-3 text-sm font-medium ${tab.href === active ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
