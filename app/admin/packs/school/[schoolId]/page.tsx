import { redirect } from "next/navigation";

interface SchoolDrilldownProps {
  params: Promise<{ schoolId: string }>;
}

export default async function SchoolPacksDrilldownPage({ params }: SchoolDrilldownProps) {
  const { schoolId } = await params;
  redirect(`/admin/packs/${schoolId}`);
}
