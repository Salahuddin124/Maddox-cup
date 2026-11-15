import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { ADMIN_COOKIE, verifyAdminToken } from "../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MADDOXX CUP — Admin sign in",
  description: "Private sign in for the MADDOXX CUP registration dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (token && verifyAdminToken(token)) {
    redirect("/admin");
  }

  return <LoginForm />;
}
