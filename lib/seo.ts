import type { Metadata } from "next";

export const siteName = "Pexpacks";
export const siteUrl = "https://pexpacks.co.za";
export const defaultOgImage = `${siteUrl}/opengraph-image.jpg`;
export const defaultTwitterImage = `${siteUrl}/twitter-image.jpg`;
export const defaultImageAlt = "Pexpacks school and office stationery packs";

function canonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
}

export function buildMetadata(
  title: string,
  description: string,
  path = "/"
): Metadata {
  const absoluteUrl = canonicalUrl(path);
  const normalizedTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;

  return {
    metadataBase: new URL(siteUrl),
    title: normalizedTitle,
    description,
    keywords: [
      "Pexpacks",
      "school stationery packs",
      "office supply packs",
      "South Africa",
    ],
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
          url: defaultOgImage,
          width: 1200,
          height: 630,
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
          url: defaultTwitterImage,
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
