import { redirect } from "next/navigation";

export default function LegacyOfficeRedirectPage() {
  redirect("/office-packs");
}
