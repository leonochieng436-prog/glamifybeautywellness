import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createUser, deleteUser, setRole } from "@/app/admin/actions2";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Button, Card, DataTable, EmptyState, FormField, Input, PageHeader, Select, StatusPill, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";

export default async function Users({ searchParams }: { searchParams: Promise<Query> }) {
  const [me, users, query] = await Promise.all([
    requireAdmin(),
    db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    searchParams,
  ]);
  if (me.role !== "ADMIN") return <p role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-900">Only administrators can manage accounts.</p>;

  const messages: Record<string, string> = {
    user: "Admin account created.",
    role: "Account role updated.",
    delete: "Admin account deleted.",
  };
  const columns = [
    { key: "name", header: "User", render: (user: (typeof users)[number]) => <div><p className="font-semibold">{user.name}</p><p className="text-xs text-muted">{user.email}</p></div> },
    { key: "role", header: "Role", render: (user: (typeof users)[number]) => <StatusPill status={user.role} /> },
    { key: "created", header: "Created", render: (user: (typeof users)[number]) => user.createdAt.toLocaleDateString("en-KE") },
    {
      key: "actions",
      header: "Actions",
      render: (user: (typeof users)[number]) => user.id === me.id ? (
        <span className="text-sm text-muted">Signed-in account</span>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmDialog action={setRole.bind(null, user.id)} message={`Change ${user.name}'s role? This affects their admin access.`} className="flex items-center gap-2">
            <label htmlFor={`role-${user.id}`} className="sr-only">Role for {user.name}</label>
            <Select id={`role-${user.id}`} name="role" defaultValue={user.role} className="min-w-[7rem]">
              <option value="ADMIN">ADMIN</option><option value="STAFF">STAFF</option>
            </Select>
            <Button type="submit" variant="secondary">Save role</Button>
          </ConfirmDialog>
          <ConfirmDialog action={deleteUser.bind(null, user.id)} message={`Permanently delete the account for ${user.name}?`}>
            <Button type="submit" variant="danger">Delete</Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Admin users" description="Manage staff access to the back office." />
      {messages[one(query.saved)] && <div className="mb-5"><Toast message={messages[one(query.saved)]} /></div>}
      <Card className="mb-6">
        <DataTable
          rows={users}
          rowKey={(user) => user.id}
          columns={columns}
          empty={<EmptyState title="No user accounts" description="Create an account to invite a teammate." />}
        />
      </Card>
      <Card>
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Add account</h2></div>
        <form action={createUser} className="grid gap-4 p-5 sm:grid-cols-2">
          <FormField label="Name" htmlFor="user-name"><Input id="user-name" name="name" required minLength={2} autoComplete="name" /></FormField>
          <FormField label="Email" htmlFor="user-email"><Input id="user-email" name="email" type="email" required autoComplete="email" /></FormField>
          <FormField label="Password" htmlFor="user-password" hint="Use at least 10 characters."><Input id="user-password" name="password" type="password" minLength={10} required autoComplete="new-password" /></FormField>
          <FormField label="Role" htmlFor="user-role"><Select id="user-role" name="role" defaultValue="STAFF"><option value="STAFF">STAFF</option><option value="ADMIN">ADMIN</option></Select></FormField>
          <div className="sm:col-span-2"><Button type="submit">Create account</Button></div>
        </form>
      </Card>
    </>
  );
}
