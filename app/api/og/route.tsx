import { ImageResponse } from "next/og";

// Node runtime: next/og bundles exceed Vercel's 1 MB Edge Function size limit.
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Fetch dynamic parameters from URL query strings
    const school = searchParams.get("school") || "School Stationery Kit";
    const grade = searchParams.get("grade") || "All Grades";
    const price = searchParams.get("price");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
            backgroundColor: "#111827",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #374151 2px, transparent 0)",
            backgroundSize: "40px 40px",
            color: "#FFFFFF",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  fontSize: 24,
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                PEXPACKS
              </div>
              <span style={{ fontSize: 24, color: "#9CA3AF" }}>
                Supplies
              </span>
            </div>
            {price && (
              <span
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  padding: "8px 20px",
                  borderRadius: "12px",
                }}
              >
                R{price}
              </span>
            )}
          </div>

          {/* Center */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 26,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                fontWeight: 600,
              }}
            >
              Official School Pack
            </span>
            <span
              style={{
                fontSize: 52,
                fontWeight: "bold",
                marginTop: "8px",
                color: "#F9FAFB",
                lineHeight: 1.15,
              }}
            >
              {school}
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#60A5FA",
                marginTop: "12px",
              }}
            >
              {grade}
            </span>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "2px solid #1F2937",
              paddingTop: "24px",
              fontSize: 20,
              color: "#9CA3AF",
            }}
          >
            <span>pexpacks.co.za • Curated School Stationery Bundles</span>
            <div style={{ display: "flex", gap: "24px", color: "#60A5FA" }}>
              <span>✓ Complete List</span>
              <span>✓ Door Delivery</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate image";
    return new Response(`Failed to generate image: ${errorMsg}`, { status: 500 });
  }
}
