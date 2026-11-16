"use client";

import {
  LayoutDashboard,
  Layers,
  Mail,
  Package,
  PanelsTopLeft,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  TicketPercent,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string; icon: LucideIcon; adminOnly?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  { label: "Catalogue", items: [{ label: "Products", href: "/admin/products", icon: Package }, { label: "Categories", href: "/admin/categories", icon: Tag }, { label: "Collections", href: "/admin/collections", icon: Layers }] },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Discount codes", href: "/admin/marketing#discount-codes", icon: TicketPercent },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Reviews", href: "/admin/content#reviews", icon: Star },
      { label: "Newsletter subscribers", href: "/admin/marketing#subscribers", icon: Mail },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Banners, testimonials & FAQ", href: "/admin/content", icon: PanelsTopLeft },
      { label: "Hero slides", href: "/admin/content/hero-slides", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Store settings", href: "/admin/settings", icon: Settings },
      { label: "Admin users", href: "/admin/users", icon: Users, adminOnly: true },
    ],
  },
];

export default function Sidebar({
  role,
  collapsed,
  mobileOpen,
  closeMobile,
}: {
  role: string;
  collapsed: boolean;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const pathname = usePathname();
  const width = collapsed ? "lg:w-[76px]" : "lg:w-64";
  return (
    <aside
      id="admin-sidebar"
      aria-label="Admin navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${width} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <Link href="/admin" onClick={closeMobile} className={`flex min-w-0 flex-1 items-center gap-3 font-semibold ${collapsed ? "lg:justify-center" : ""}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary text-white"><Store size={18} /></span>
          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>Beauty & Wellness</span>
        </Link>
        <button type="button" onClick={closeMobile} aria-label="Close navigation menu" className="grid h-10 w-10 place-items-center text-white/75 hover:bg-white/10 hover:text-white lg:hidden">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin sections">
        {groups.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || role === "ADMIN");
          return (
            <div key={group.label} className="mb-5">
              <h2 className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45 ${collapsed ? "lg:sr-only" : ""}`}>{group.label}</h2>
              <ul className="space-y-1">
                {items.map(({ label, href, icon: Icon }) => {
                  const path = href.split("#")[0];
                  const active = path === "/admin"
                    ? pathname === path
                    : pathname === path || (path !== "/admin/content" && pathname.startsWith(`${path}/`));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? label : undefined}
                        onClick={closeMobile}
                        className={`flex min-h-11 items-center gap-3 px-3 text-sm transition-colors ${active ? "bg-primary font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"} ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                      >
                        <Icon size={18} aria-hidden="true" />
                        <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 px-3 text-sm text-white/75 hover:bg-white/10 hover:text-white">
          <Store size={18} aria-hidden="true" />
          <span className={collapsed ? "lg:hidden" : ""}>View store</span>
        </Link>
      </div>
    </aside>
  );
}
