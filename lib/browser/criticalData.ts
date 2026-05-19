import {
  generalEmail,
  generalEmailHref,
  orderWhatsAppHref,
  ordersEmail,
  ordersEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import { mainNavLinks } from "@/data/navigation";
import {
  getFeaturedSchoolRecords,
  getSchoolSearchOptions,
} from "@/lib/schools/schoolSearchData";
import { siteName, siteUrl } from "@/lib/seo";

export type PexpacksBrowserData = ReturnType<typeof getPexpacksBrowserData>;

export function getPexpacksBrowserData() {
  const { grades } = getSchoolSearchOptions();
  const featuredSchools = getFeaturedSchoolRecords().map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
    region: school.region,
    province: school.province,
    grades: school.grades,
    isPartner: school.isPartner,
    lowestPrice: school.lowestPrice,
  }));

  return {
    app: {
      name: siteName,
      legalName: "Pexpacks Supplies",
      url: siteUrl,
      locale: "en-ZA",
      country: "ZA",
      currency: "ZAR",
    },
    contact: {
      generalEmail,
      generalEmailHref,
      ordersEmail,
      ordersEmailHref,
      phoneNumber,
      phoneHref,
      orderWhatsAppHref,
    },
    navigation: {
      primary: mainNavLinks,
    },
    search: {
      minQueryLength: 2,
      defaultLimit: 12,
      grades,
      featuredSchools,
    },
  };
}

export function serializeBrowserData(data: PexpacksBrowserData) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
