import localFont from "next/font/local";

/**
 * Pexpacks body font. The private source variable is aliased to the semantic
 * --font-sans token in styles/globals.css to avoid Tailwind v4 token collisions.
 */
export const pexSans = localFont({
  src: [
    {
      path: "../public/fonts/PexSans Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pex-sans",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

/** Pexpacks display and heading font. */
export const pexSansAlt = localFont({
  src: [
    {
      path: "../public/fonts/PexSans Alt Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Semi Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pex-heading",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});