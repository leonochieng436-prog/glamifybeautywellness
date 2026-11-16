import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.adminUser.findUnique({ where: { id: session.id }, select: { name: true, email: true } })
    : null;
  return (
    <AdminShell
      user={session ? { ...session, name: user?.name ?? "Admin", email: user?.email ?? "" } : null}
      logout={logout}
    >
      {children}
    </AdminShell>
  );
}
