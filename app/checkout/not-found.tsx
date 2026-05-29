import { Button } from "@/components/ui/Button";
import { buildWhatsAppHref } from "@/data/contact";

export default function CheckoutNotFound() {
  const whatsappHref = buildWhatsAppHref(
    "Hi PexPacks, I could not find my checkout pack. Please help me choose the right school pack."
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "64px var(--gutter-desktop)",
        background: "var(--pex-bg-soft)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          width: "min(100%, 560px)",
          border: "var(--card-border)",
          borderRadius: "var(--radius-card-lg)",
          background: "var(--card-bg)",
          boxShadow: "var(--card-shadow)",
          padding: "clamp(28px, 6vw, 44px)",
          display: "grid",
          gap: 18,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--pex-keppel)",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: 13,
            letterSpacing: 0.2,
          }}
        >
          Checkout
        </p>
        <h1
          style={{
            margin: 0,
            color: "var(--pex-primary)",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.7rem, 4vw, 2.55rem)",
            lineHeight: 1.05,
          }}
        >
          We could not find this pack.
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--pex-text-muted)",
            lineHeight: 1.55,
          }}
        >
          Choose your school and grade again, or contact PexPacks and we will
          help you find the right stationery pack.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <Button href="/schools">Find Your School Pack</Button>
          {whatsappHref ? (
            <Button href={whatsappHref} variant="outline">
              Contact PexPacks
            </Button>
          ) : (
            <Button href="/contact" variant="outline">
              Contact PexPacks
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
