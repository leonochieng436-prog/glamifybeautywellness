"use client";

import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/admin/MobileNav";

type AdminUser = { name: string; role: string };
type PageInfo = { title: string; breadcrumb: string };

export default function Topbar({
  user,
  page,
  logout,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onOpenMobileNav,
  onCloseMobileNav,
}: {
  user: AdminUser;
  page: PageInfo;
  logout: (formData: FormData) => void | Promise<void>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onOpenMobileNav: () => void;
  onCloseMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav open={mobileOpen} onOpen={onOpenMobileNav} onClose={onCloseMobileNav} />
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
          className="hidden h-10 w-10 shrink-0 place-items-center border border-line text-ink hover:border-primary hover:text-primary lg:grid"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{page.breadcrumb}</p>
          <p className="truncate text-sm font-semibold text-ink sm:text-base">{page.title}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="hidden min-h-11 items-center gap-2 px-2 text-sm font-medium text-muted hover:text-primary sm:flex">
          <Store size={16} aria-hidden="true" />
          View store
        </Link>
        <div className="hidden text-right md:block">
          <p className="max-w-40 truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted">{user.role}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="min-h-11 border border-line px-3 text-sm font-semibold hover:border-primary hover:text-primary sm:px-4">Log out</button>
        </form>
      </div>
    </header>
  );
}
