"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

type AdminUser = { id: string; name: string; email: string; role: string };
const pages = [
  { match: (path: string) => path === "/admin", title: "Dashboard", breadcrumb: "Overview" },
  { match: (path: string) => path.startsWith("/admin/products"), title: "Products", breadcrumb: "Catalogue" },
  { match: (path: string) => path.startsWith("/admin/categories"), title: "Categories", breadcrumb: "Catalogue" },
  { match: (path: string) => path.startsWith("/admin/collections"), title: "Collections", breadcrumb: "Catalogue" },
  { match: (path: string) => path.startsWith("/admin/orders"), title: "Orders", breadcrumb: "Sales" },
  { match: (path: string) => path.startsWith("/admin/content"), title: "Homepage content", breadcrumb: "Content" },
  { match: (path: string) => path.startsWith("/admin/marketing"), title: "Marketing", breadcrumb: "Sales" },
  { match: (path: string) => path.startsWith("/admin/settings"), title: "Store settings", breadcrumb: "Settings" },
  { match: (path: string) => path.startsWith("/admin/users"), title: "Admin users", breadcrumb: "Settings" },
];

export default function AdminShell({
  user,
  logout,
  children,
}: {
  user: AdminUser | null;
  logout: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (!user || pathname === "/admin/login") return children;

  const page = pages.find((candidate) => candidate.match(pathname)) ?? pages[0];
  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <Sidebar role={user.role} collapsed={collapsed} mobileOpen={mobileOpen} closeMobile={closeMobile} />
      <div className={`min-h-screen transition-[padding] lg:pl-64 ${collapsed ? "lg:pl-[76px]" : ""}`}>
        <Topbar
          user={user}
          page={page}
          logout={logout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          mobileOpen={mobileOpen}
          onOpenMobileNav={openMobile}
          onCloseMobileNav={closeMobile}
        />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
