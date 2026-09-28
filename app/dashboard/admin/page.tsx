import { redirect } from "next/navigation";
import AdminConsole from "@/components/AdminConsole";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "admin") redirect("/dashboard");

  return <AdminConsole />;
}