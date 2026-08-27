import { requireAdmin } from "@/lib/admin/rbac";
import { getQuotationSettings, getQuotationSystemInfo } from "@/lib/admin/quotation-settings";
import { PexpacksDetailsView } from "@/components/admin/quotations/PexpacksDetailsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pexpacks Details | Quotations | Admin | Pexpacks",
  description: "Configure business details, addresses, banking settlement info, and commercial terms used on Pexpacks quotations.",
};

export default async function PexpacksDetailsPage() {
  await requireAdmin({ permission: "orders.view" });

  const [settings, systemInfo] = await Promise.all([
    getQuotationSettings(),
    getQuotationSystemInfo(),
  ]);

  return (
    <PexpacksDetailsView
      initialSettings={settings}
      systemInfo={systemInfo}
    />
  );
}
