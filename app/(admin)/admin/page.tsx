import { requireAdmin } from "@backend/auth/admin-auth.service";
import { AdminPanel } from "@admin/components/admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdmin("/admin");
  return <AdminPanel user={session.displayName} signOut="/" />;
}
