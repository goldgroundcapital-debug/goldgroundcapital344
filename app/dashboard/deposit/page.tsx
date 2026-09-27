import { redirect } from "next/navigation";

export default function DepositRedirect() {
  redirect("/dashboard/wallet");
}
