import { redirect } from "next/navigation";

export default function LegacyItemsRedirectPage() {
  redirect("/admin/products");
}
