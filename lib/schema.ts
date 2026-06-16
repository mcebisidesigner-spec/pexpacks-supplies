import type { FAQ } from "@/data/faqs";
import type { GradePack, School } from "@/data/schools";
import {
  generalEmail,
  internationalPhoneNumber,
  ordersEmail,
} from "@/data/contact";
import { featuredPacks } from "@/data/packs";
import { brandLogoUrls } from "@/lib/brand-assets";
import { formatCurrency } from "@/lib/formatCurrency";
import { siteName, siteUrl, defaultOgImage } from "@/lib/seo";

const organizationId = `${siteUrl}/#organization`;
const storeId = `${siteUrl}/#online-store`;
const websiteId = `${siteUrl}/#website`;
const catalogId = `${siteUrl}/#stationery-pack-catalog`;
const schoolPackImage = `${siteUrl}/images/hero-school-delivery.webp`;
const productPackImage = `${siteUrl}/images/unboxing-G7.webp`;

const productAvailability = {
  "in-stock": "https://schema.org/InStock",
  "pre-order": "https://schema.org/PreOrder",
  seasonal: "https://schema.org/LimitedAvailability",
} satisfies Record<GradePack["availability"], string>;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteName,
    legalName: "Pexpacks Supplies",
    url: siteUrl,
    logo: brandLogoUrls.default,
    image: schoolPackImage,
    slogan: "Save time, Pex it.",
    description:
      "Pexpacks Supplies prepares exclusive school stationery packs, standard grade combos, and convenience-driven pack services for South African parents and schools.",
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: `+${internationalPhoneNumber}`,
        email: generalEmail,
        areaServed: "ZA",
        availableLanguage: ["en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "orders",
        telephone: `+${internationalPhoneNumber}`,
        email: ordersEmail,
        areaServed: "ZA",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function onlineStoreSchema() {
  const schoolOffers = featuredPacks
    .filter((pack) => pack.category === "School")
    .map((pack) => ({
      "@type": "Offer",
      name: pack.name,
      url: `${siteUrl}${pack.href}`,
      category: `${pack.category} stationery pack`,
      availability: "https://schema.org/InStock",
      priceCurrency: "ZAR",
      priceSpecification: pack.priceLabel.startsWith("From R ")
        ? {
            "@type": "PriceSpecification",
            minPrice: Number(pack.priceLabel.replace("From R ", "")),
            priceCurrency: "ZAR",
          }
        : undefined,
      itemOffered: {
        "@type": "Product",
        name: pack.name,
        brand: {
          "@id": organizationId,
        },
        image: schoolPackImage,
        category: `${pack.category} stationery pack`,
        description: pack.description,
        offers: {
          "@type": "Offer",
          name: pack.name,
          url: `${siteUrl}${pack.href}`,
          availability: "https://schema.org/InStock",
          priceCurrency: "ZAR",
          priceSpecification: pack.priceLabel.startsWith("From R ")
            ? {
                "@type": "PriceSpecification",
                minPrice: Number(pack.priceLabel.replace("From R ", "")),
                priceCurrency: "ZAR",
              }
            : undefined,
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@id": organizationId,
          },
        },
      },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": storeId,
    name: siteName,
    url: siteUrl,
    logo: brandLogoUrls.default,
    image: [schoolPackImage, productPackImage],
    telephone: `+${internationalPhoneNumber}`,
    email: generalEmail,
    parentOrganization: {
      "@id": organizationId,
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    description:
      "Online supplier of exclusive school stationery packs and grade-specific school-list packs.",
    knowsAbout: [
      "school stationery packs",
      "grade-specific stationery lists",
      "book covering add-ons",
      "school stationery fulfilment",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      "@id": catalogId,
      name: "Pexpacks stationery pack catalog",
      description:
        "A catalog of school stationery packs, standard grade packs, and pack preparation services.",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "School stationery packs",
          description:
            "Exclusive and grade-specific stationery packs prepared according to school lists.",
          itemListElement: schoolOffers,
        },
        {
          "@type": "Offer",
          name: "Pexcover book covering add-on",
          url: `${siteUrl}/blog/what-is-pexcover-book-covering`,
          category: "Book covering service",
          itemOffered: {
            "@type": "Service",
            name: "Pexcover",
            provider: {
              "@id": organizationId,
            },
            description:
              "Book covering and preparation add-on for school stationery packs.",
          },
        },
      ],
    },
    potentialAction: {
      "@type": "OrderAction",
      target: `${siteUrl}/order`,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    url: siteUrl,
    publisher: {
      "@id": organizationId,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/schools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
        text: item.answer,
      },
    })),
  };
}

export function productSchema(school: School, grade: GradePack) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/schools/${school.slug}#${grade.gradeSlug}-product`,
    name: `${grade.grade} Stationery Pack for ${school.name}`,
    description: `Ready-to-use ${grade.grade} stationery pack prepared for ${school.name}, packed according to school stationery requirements for convenient collection or delivery.`,
    image: productPackImage,
    sku: grade.id,
    url: `${siteUrl}/schools/${school.slug}`,
    mainEntityOfPage: `${siteUrl}/schools/${school.slug}`,
    brand: {
      "@id": organizationId,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: grade.price,
      availability: productAvailability[grade.availability],
      url: `${siteUrl}/schools/${school.slug}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": organizationId,
      },
    },
    category: "School stationery pack",
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "School",
        value: school.name,
      },
      {
        "@type": "PropertyValue",
        name: "Grade",
        value: grade.grade,
      },
      {
        "@type": "PropertyValue",
        name: "Display price",
        value: formatCurrency(grade.price),
      },
      {
        "@type": "PropertyValue",
        name: "Pack contents",
        value: grade.contents.join(", "),
      },
    ],
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
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function articleSchema(post: {
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  author: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.excerpt,
    image: post.image ? `${siteUrl}${post.image}` : defaultOgImage,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@id": organizationId,
    },
    datePublished: post.date,
    dateModified: post.date,
  };
}
