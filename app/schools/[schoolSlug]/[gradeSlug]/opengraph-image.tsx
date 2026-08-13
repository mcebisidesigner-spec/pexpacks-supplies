import { ImageResponse } from "next/og";
import { getCachedSchoolBySlug } from "@/lib/school-utils";

export const alt = "Pexpacks School Stationery Kit Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
// Node runtime: next/og bundles exceed Vercel's 1 MB Edge Function size limit.
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ schoolSlug: string; gradeSlug: string }>;
}) {
  const { schoolSlug, gradeSlug } = await params;
  const school = await getCachedSchoolBySlug(schoolSlug);
  const grade = school?.grades.find((g) => g.gradeSlug === gradeSlug);

  const schoolName = school?.name || schoolSlug.replace(/-/g, " ").toUpperCase();
  const gradeText = grade?.grade || gradeSlug.replace(/-/g, " ").toUpperCase();
  const priceText = grade?.price ? `R${grade.price}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0F172A",
          padding: "60px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header: Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                padding: "10px 24px",
                borderRadius: "9999px",
                fontSize: 24,
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              PEXPACKS
            </div>
            <span style={{ fontSize: 24, color: "#94A3B8" }}>
              Official Stationery Bundle
            </span>
          </div>
          {priceText ? (
            <div
              style={{
                backgroundColor: "#059669",
                color: "#FFFFFF",
                padding: "8px 20px",
                borderRadius: "12px",
                fontSize: 26,
                fontWeight: "bold",
              }}
            >
              {priceText}
            </div>
          ) : (
            <span style={{ fontSize: 20, color: "#38BDF8", fontWeight: 600 }}>
              Academic Year Pack
            </span>
          )}
        </div>

        {/* Middle Section: Dynamic School & Grade Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: "#F8FAFC",
              lineHeight: 1.1,
            }}
          >
            {schoolName}
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#38BDF8",
            }}
          >
            {`${gradeText} Pack`}
          </div>
        </div>

        {/* Bottom Bar: Key Features & Callout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "2px solid #1E293B",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "32px", fontSize: 22, color: "#CBD5E1" }}>
            <span>✓ Complete Teacher List</span>
            <span>✓ Pre-Packaged & Labeled</span>
          </div>
          <div
            style={{
              backgroundColor: "#10B981",
              color: "#FFFFFF",
              padding: "12px 28px",
              borderRadius: "12px",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Pre-Orders Open
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
