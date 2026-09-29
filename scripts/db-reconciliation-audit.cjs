const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index),
        line.slice(index + 1).replace(/^["']|["']$/g, ""),
      ];
    }),
);

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase URL or service-role key.");

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function rows(table, columns) {
  const pageSize = 1000;
  const all = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(table + ": " + error.message);

    const page = data || [];
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

function duplicateValueCount(values) {
  return [...countBy(values).values()].filter((count) => count > 1).length;
}

function hasMoreThanTwoDecimals(value) {
  if (value == null) return false;
  return !Number.isInteger(Number(value) * 100);
}

function gradeKey(pack) {
  const source =
    String(pack.slug || "") + " " + String(pack.title || "");
  const match = source.match(/\bgrade[-\s]*([r\d]+)/i);
  return match ? pack.school_id + ":grade-" + match[1].toLowerCase() : null;
}

function isPublishedSchool(school) {
  return (
    school &&
    school.status === "active" &&
    school.published === true &&
    (school.publication_status == null || school.publication_status === "published")
  );
}

function isPublishedPack(pack) {
  return (
    pack &&
    pack.visible === true &&
    (pack.publication_status == null || pack.publication_status === "published")
  );
}

function effectiveItemPrice(item, productsById) {
  const product = item.product_id ? productsById.get(item.product_id) : null;
  return Number(
    item.selling_price_override ??
      product?.current_selling_price ??
      product?.calculated_selling_price ??
      0,
  );
}

(async () => {
  const [
    schools,
    packs,
    packItems,
    products,
    payments,
    quotations,
    testimonials,
  ] = await Promise.all([
    rows("schools", "id,slug,status,published,publication_status,refused_partnership"),
    rows("school_packs", "id,school_id,slug,title,visible,publication_status,pricing_status,price,stock"),
    rows(
      "school_pack_items",
      "id,pack_id,product_id,pack_quantity,active,selling_price_override",
    ),
    rows("master_products", "id,active,visibility,current_selling_price,calculated_selling_price"),
    rows(
      "payments",
      "amount,currency,payment_gateway,status,created_at,updated_at",
    ),
    rows("quotations", "delivery_fee,discount_amount"),
    rows("cms_testimonials", "school_id,school_name"),
  ]);

  const schoolsById = new Map(schools.map((school) => [school.id, school]));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const itemsByPackId = new Map();

  for (const item of packItems) {
    const list = itemsByPackId.get(item.pack_id) || [];
    list.push(item);
    itemsByPackId.set(item.pack_id, list);
  }

  const publicPacks = packs.filter(isPublishedPack);
  const publicPackChecks = publicPacks.map((pack) => {
    const school = schoolsById.get(pack.school_id);
    const items = itemsByPackId.get(pack.id) || [];
    const activeItems = items.filter((item) => item.active !== false);
    const missingProducts = activeItems.filter(
      (item) => !item.product_id || !productsById.has(item.product_id),
    );
    const inactiveProducts = activeItems.filter((item) => {
      const product = item.product_id ? productsById.get(item.product_id) : null;
      return (
        product &&
        (product.active === false || product.visibility !== "public")
      );
    });
    const invalidQuantities = activeItems.filter(
      (item) =>
        !Number.isInteger(Number(item.pack_quantity)) ||
        Number(item.pack_quantity) < 1,
    );
    const invalidItemPrices = activeItems.filter(
      (item) => effectiveItemPrice(item, productsById) <= 0,
    );

    return {
      pack,
      school,
      items,
      activeItems,
      missingProducts,
      inactiveProducts,
      invalidQuantities,
      invalidItemPrices,
    };
  });

  const schoolSlugs = schools
    .map((school) => String(school.slug || "").trim().toLowerCase())
    .filter(Boolean);
  const packSlugs = packs
    .map((pack) => String(pack.slug || "").trim().toLowerCase())
    .filter(Boolean);
  const gradeKeys = packs.map(gradeKey).filter(Boolean);
  const duplicateGradeValues = [...countBy(gradeKeys).entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key);

  console.log(
    JSON.stringify(
      {
        schools: {
          total: schools.length,
          missing_or_blank_slug: schools.filter(
            (school) => !String(school.slug || "").trim(),
          ).length,
          duplicate_slug_values: duplicateValueCount(schoolSlugs),
          inactive_or_unpublished: schools.filter(
            (school) => !isPublishedSchool(school),
          ).length,
        },
        catalogue: {
          total_packs: packs.length,
          total_pack_items: packItems.length,
          active_pack_items: packItems.filter((item) => item.active !== false).length,
          visible_packs: publicPacks.length,
          published_packs_with_unapproved_price: publicPackChecks.filter(
            (check) =>
              check.pack.pricing_status !== "ready" ||
              Number(check.pack.price ?? 0) <= 0,
          ).length,
          missing_or_blank_pack_slug: packs.filter(
            (pack) => !String(pack.slug || "").trim(),
          ).length,
          duplicate_pack_slug_values: duplicateValueCount(packSlugs),
          duplicate_grade_values: duplicateGradeValues.length,
          duplicate_grade_samples: duplicateGradeValues.slice(0, 10),
          visible_pack_missing_school: publicPackChecks.filter(
            (check) => !check.school,
          ).length,
          visible_pack_with_unpublished_school: publicPackChecks.filter(
            (check) => !isPublishedSchool(check.school),
          ).length,
          visible_pack_without_active_items: publicPackChecks.filter(
            (check) => check.activeItems.length === 0,
          ).length,
          visible_pack_with_missing_products: publicPackChecks.filter(
            (check) => check.missingProducts.length > 0,
          ).length,
          visible_pack_with_non_public_products: publicPackChecks.filter(
            (check) => check.inactiveProducts.length > 0,
          ).length,
          visible_pack_with_invalid_item_prices: publicPackChecks.filter(
            (check) => check.invalidItemPrices.length > 0,
          ).length,
          visible_pack_with_zero_price_and_items: publicPackChecks.filter(
            (check) =>
              check.activeItems.length > 0 &&
              Number(check.pack.price ?? 0) <= 0,
          ).length,
          active_items_with_invalid_quantity: packItems.filter(
            (item) =>
              item.active !== false &&
              (!Number.isInteger(Number(item.pack_quantity)) ||
                Number(item.pack_quantity) < 1),
          ).length,
        },
        payments: {
          total: payments.length,
          missing_amount: payments.filter((row) => row.amount == null).length,
          missing_currency: payments.filter((row) => !row.currency).length,
          missing_gateway: payments.filter((row) => !row.payment_gateway).length,
          missing_status: payments.filter((row) => !row.status).length,
          missing_created_at: payments.filter((row) => !row.created_at).length,
        },
        quotations: {
          total: quotations.length,
          missing_delivery_fee: quotations.filter(
            (row) => row.delivery_fee == null,
          ).length,
          missing_discount_amount: quotations.filter(
            (row) => row.discount_amount == null,
          ).length,
          delivery_fee_over_two_decimals: quotations.filter((row) =>
            hasMoreThanTwoDecimals(row.delivery_fee),
          ).length,
          discount_amount_over_two_decimals: quotations.filter((row) =>
            hasMoreThanTwoDecimals(row.discount_amount),
          ).length,
        },
        testimonials: {
          total: testimonials.length,
          missing_school_context: testimonials.filter(
            (row) =>
              !row.school_id && !String(row.school_name || "").trim(),
          ).length,
        },
      },
      null,
      2,
    ),
  );
})().catch((error) => {
  console.error("Reconciliation audit failed: " + error.message);
  process.exit(1);
});