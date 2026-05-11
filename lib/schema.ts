import type { FAQ } from "@/data/faqs";
import type { GradePack, School } from "@/data/schools";
import { generalEmail, internationalPhoneNumber, ordersEmail } from "@/data/contact";
import { formatCurrency } from "@/lib/formatCurrency";
import { siteName, siteUrl } from "@/lib/seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.svg`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: `+${internationalPhoneNumber}`,
        email: generalEmail,
        areaServed: "ZA",
        availableLanguage: ["en"]
      },
      {
        "@type": "ContactPoint",
        contactType: "orders",
        telephone: `+${internationalPhoneNumber}`,
        email: ordersEmail,
        areaServed: "ZA",
        availableLanguage: ["en"]
      }
    ]
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.svg`,
    telephone: `+${internationalPhoneNumber}`,
    email: generalEmail,
    areaServed: "South Africa",
    description:
      "Ready-packed school stationery and SME office supplies for South African families, schools and businesses."
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/schools?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function faqPageSchema(items: FAQ[]) {
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

export function productSchema(school: School, grade: GradePack) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${grade.grade} Stationery Pack for ${school.name}`,
    description: `Ready-to-use ${grade.grade} stationery pack prepared for ${school.name}.`,
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

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
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
