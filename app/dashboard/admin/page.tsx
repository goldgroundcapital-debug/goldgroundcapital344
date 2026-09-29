import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/authorization";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/dashboard");

  return <AdminDashboard />;
}