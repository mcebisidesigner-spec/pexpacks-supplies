import type { Metadata } from "next";
import type { FAQ } from "@/data/faqs";
import type { GradePack, School } from "@/data/schools";
import { formatCurrency } from "@/lib/formatCurrency";

const siteName = "Pexpacks Supplies";
export const siteUrl = "https://pexpackssupplies.co.za";
const defaultOgImage = "/images/og-img.jpg";

export function buildMetadata(title: string, description: string, path = "/"): Metadata {
  const absoluteUrl = `${siteUrl}${path}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${title} | ${siteName}`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "Pexpacks Supplies",
      "convenience packs",
      "school stationery packs",
      "office supply packs",
      "Pexpacks",
      "household essentials",
      "South Africa"
    ],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: "Pexpacks Supplies stationery supplies prepared for school and office packs"
        }
      ],
      locale: "en_ZA",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage],
      creator: "@pexpackssupplies",
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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness", 
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.svg`,
    areaServed: "South Africa",
    sameAs: [],
    description:
      "Ready-packed school stationery, SME office supplies and household convenience packs for South African families, schools and businesses."
  };
}

export function faqJsonLd(items: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function productJsonLd(school: School, grade: GradePack) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${school.name} ${grade.grade} Stationery Pack`,
    description: `Official stationery pack prepared for ${school.name} ${grade.grade}.`,
    brand: {
      "@type": "Brand",
      name: siteName
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: grade.price,
      availability: "https://schema.org/PreOrder",
      url: `${siteUrl}/schools/${school.slug}/${grade.gradeSlug}`
    },
    category: "School stationery",
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Display price",
        value: formatCurrency(grade.price)
      }
    ]
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`
    }))
  };
}
