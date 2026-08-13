import type { Metadata } from "next";

export const siteName = "Pexpacks";
export const siteUrl = "https://pexpacks.co.za";
export const defaultOgImage = `${siteUrl}/opengraph-image.jpg`;
const defaultTwitterImage = `${siteUrl}/twitter-image.jpg`;
const defaultImageAlt = "Pexpacks school stationery packs";

function canonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
}

export function buildMetadata(
  title: string,
  description: string,
  path = "/",
  imageUrl?: string,
  customKeywords?: string[]
): Metadata {
  const absoluteUrl = canonicalUrl(path);
  const normalizedTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;

  const baseKeywords = [
    "Pexpacks",
    "school stationery packs",
    "South Africa",
    "grade specific school supplies",
    "online stationery shop",
    "buy school packs",
    "ready packed stationery",
  ];

  const keywords = customKeywords
    ? [...new Set([...baseKeywords, ...customKeywords])]
    : baseKeywords;

  const imgWidth = imageUrl ? 1200 : 512;
  const imgHeight = imageUrl ? 630 : 512;

  return {
    metadataBase: new URL(siteUrl),
    title: normalizedTitle,
    description,
    keywords,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    openGraph: {
      title: normalizedTitle,
      description,
      url: absoluteUrl,
      siteName,
      locale: "en_ZA",
      type: "website",
      images: [
        {
          url: imageToUse,
          width: imgWidth,
          height: imgHeight,
          alt: defaultImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      creator: "@pexpacks",
      images: [
        {
          url: twitterImageToUse,
          width: imgWidth,
          height: imgHeight,
          alt: defaultImageAlt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical: absoluteUrl,
    },
  };
}
