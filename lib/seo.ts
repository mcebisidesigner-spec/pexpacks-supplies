import type { Metadata } from "next";

export const siteName = "PexPacks";
export const siteUrl = "https://pexpacks.co.za";
const defaultOgImage = "/opengraph-image.jpg";

export function buildMetadata(title: string, description: string, path = "/"): Metadata {
  const absoluteUrl = `${siteUrl}${path}`;
  const normalizedTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    metadataBase: new URL(siteUrl),
    title: normalizedTitle,
    description,
    keywords: [
      "PexPacks",
      "convenience packs",
      "school stationery packs",
      "office supply packs",
      "household essentials",
      "South Africa"
    ],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    openGraph: {
      title: normalizedTitle,
      description,
      url: absoluteUrl,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: "PexPacks stationery supplies prepared for school and office packs"
        }
      ],
      locale: "en_ZA",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      images: ["/twitter-image.jpg"],
      creator: "@pexpacks",
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
      canonical: absoluteUrl
    }
  };
}
