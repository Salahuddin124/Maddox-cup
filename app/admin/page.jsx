import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "MADDOXX CUP — Admin",
  description: "Private registration dashboard for MADDOXX CUP.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
