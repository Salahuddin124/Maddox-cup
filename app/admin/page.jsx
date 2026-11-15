import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { ADMIN_COOKIE, verifyAdminToken } from "../../lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MADDOXX CUP — Admin",
  description: "Private registration dashboard for MADDOXX CUP.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  // No token, or a forged/expired one: never render the dashboard HTML.
  if (!token || !verifyAdminToken(token)) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
