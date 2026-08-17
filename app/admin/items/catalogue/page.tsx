import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CatalogueSearchParams = {
  q?: string | string[];
  search?: string | string[];
  page?: string | string[];
  section?: string | string[];
};

export default async function ItemCataloguePage({
  searchParams,
}: {
  searchParams: Promise<CatalogueSearchParams>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const search = Array.isArray(params.search) ? params.search[0] : params.search;
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const page = Array.isArray(params.page) ? params.page[0] : params.page;

  const query = q || search;
  if (query) urlParams.set("q", query);
  if (section) urlParams.set("section", section);
  if (page) urlParams.set("page", page);

  const qs = urlParams.toString();
  redirect(`/admin/items${qs ? `?${qs}` : ""}`);
}

