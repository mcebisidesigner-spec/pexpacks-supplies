import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getQuotation } from "@/lib/admin/quotations";
import { QuotationDetailView } from "@/components/admin/quotations/QuotationDetailView";

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QuotationDetailPageProps) {
  const { id } = await params;
  const quote = await getQuotation(id);
  return {
    title: quote ? `${quote.quote_number} | Quotations | Admin | Pexpacks` : "Quotation Details | Admin",
  };
}

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  await requireAdmin({ permission: "orders.view" });
  const { id } = await params;
  const quote = await getQuotation(id);

  if (!quote) {
    notFound();
  }

  // Canonicalize URL to use [Quote Number] instead of UUID
  if (id !== quote.quote_number) {
    redirect(`/admin/quotations/${quote.quote_number}`);
  }

  return <QuotationDetailView quotation={quote} />;
}
