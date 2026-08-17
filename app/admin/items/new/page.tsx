import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewItemPage() {
  redirect("/admin/items/add-item");
}

