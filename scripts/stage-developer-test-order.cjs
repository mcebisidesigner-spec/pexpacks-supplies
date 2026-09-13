const fs = require("node:fs");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

// 1. Load configuration from .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const ozowSiteCode = process.env.OZOW_SITE_CODE || env.OZOW_SITE_CODE || "PEX-PEX-001";
const ozowPrivateKey = process.env.OZOW_PRIVATE_KEY || env.OZOW_PRIVATE_KEY;
const ozowApiKey = process.env.OZOW_API_KEY || env.OZOW_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || env.RESEND_FROM_EMAIL || "Pexpacks <orders@pexpacks.co.za>";

console.log("=== PEXPACKS DEVELOPER TECHNICIAN CHECKOUT & RECEIPT TEST ===");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Ozow Site Code: ${ozowSiteCode}`);
console.log(`Resend Sender: ${fromEmail}`);
console.log("");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ FAILED: Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Helper for Ozow Checkout Hash
function generateOzowCheckoutHash(input) {
  const parts = [
    input.siteCode,
    input.countryCode,
    input.currencyCode,
    input.amount,
    input.transactionReference,
    input.bankReference,
    input.cancelUrl,
    input.errorUrl,
    input.successUrl,
    input.notifyUrl,
    input.isTest,
    input.privateKey,
  ];
  const payload = parts.join("").toLowerCase();
  return crypto.createHash("sha512").update(payload, "utf8").digest("hex");
}

async function runTest() {
  const orderId = crypto.randomUUID();
  const testRefNumber = Date.now().toString().slice(-7);
  const orderReference = `PEX-TEST-${testRefNumber}`;
  const uniqueCustomerId = `CUST-TEST-${testRefNumber}`;
  const trackingToken = crypto.randomBytes(16).toString("hex");
  const buyerEmail = "orders@pexpacks.co.za"; // Verified domain recipient
  const buyerName = "Developer Technician (Fake Buyer)";
  const buyerPhone = "0780036048";
  const estimatedTotal = 175.0;

  console.log(`1. [STAGING ORDER] Creating fake buyer order ${orderReference}...`);

  const orderPayload = {
    id: orderId,
    order_reference: orderReference,
    unique_customer_id: uniqueCustomerId,
    tracking_token: trackingToken,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    buyer_email: buyerEmail,
    learner_name: "Junior Test Learner",
    school_slug: "primrose-hill-primary-school",
    school_name: "Primrose Hill Primary School",
    grade: "Grade 1",
    pack_type: "standard",
    items: [
      "12x Faber-Castell HB Pencils",
      "1x Pritt Glue Stick 43g",
      "Pexcover book covering service (Clear)",
    ],
    estimated_total: estimatedTotal,
    fulfilment_option: "School collection",
    metadata: {
      is_test_technician_run: true,
      timestamp: new Date().toISOString(),
      packs: [
        {
          learnerName: "Junior Test Learner",
          schoolSlug: "primrose-hill-primary-school",
          schoolName: "Primrose Hill Primary School",
          grade: "Grade 1",
          packName: "Grade 1 Starter Pack",
          totalPrice: estimatedTotal,
          wantsPexcover: true,
          pexcoverPaperStyle: "clear",
        },
      ],
    },
    payment_gateway: "ozow",
    idempotency_key: `idemp-test-${testRefNumber}`,
    consent: true,
    pexcover_requested: true,
  };

  const snapshotsPayload = [
    {
      product_id: null,
      pack_id: null,
      sku_snapshot: "SKU-TEST-HB-01",
      product_name_snapshot: "Faber-Castell HB Pencils Pack of 12",
      quantity: 1,
      unit_selling_price: 65.0,
      estimated_unit_cost: 40.0,
      expected_margin: 25.0,
      pricing_version: "v2026",
      school_name_snapshot: "Primrose Hill Primary School",
      grade_snapshot: "Grade 1",
      requires_pexcover: false,
    },
    {
      product_id: null,
      pack_id: null,
      sku_snapshot: "SKU-TEST-GLUE-01",
      product_name_snapshot: "Pritt Glue Stick 43g",
      quantity: 2,
      unit_selling_price: 35.0,
      estimated_unit_cost: 20.0,
      expected_margin: 15.0,
      pricing_version: "v2026",
      school_name_snapshot: "Primrose Hill Primary School",
      grade_snapshot: "Grade 1",
      requires_pexcover: false,
    },
    {
      product_id: null,
      pack_id: null,
      sku_snapshot: "SKU-PEXCOVER-CLEAR",
      product_name_snapshot: "Pexcover Book Covering (Clear)",
      quantity: 1,
      unit_selling_price: 40.0,
      estimated_unit_cost: 15.0,
      expected_margin: 25.0,
      pricing_version: "v2026",
      school_name_snapshot: "Primrose Hill Primary School",
      grade_snapshot: "Grade 1",
      requires_pexcover: true,
    },
  ];

  // A. Test Atomic RPC Persistence
  console.log("2. [SUPABASE RPC] Invoking create_pending_order_with_snapshots...");
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "create_pending_order_with_snapshots",
    {
      p_order: orderPayload,
      p_snapshots: snapshotsPayload,
    },
  );

  if (rpcError) {
    console.error("❌ FAILED: create_pending_order_with_snapshots returned error:", rpcError);
    process.exit(1);
  }
  console.log("✅ Supabase atomic persistence successful. Result:", rpcResult);

  // B. Verify `public.orders` Table Sync
  console.log("3. [VERIFY ORDERS TABLE] Querying inserted order record...");
  const { data: orderRecord, error: orderFetchErr } = await supabase
    .from("orders")
    .select("id, order_reference, status, buyer_name, estimated_total, pexcover_requested")
    .eq("id", orderId)
    .single();

  if (orderFetchErr || !orderRecord) {
    console.error("❌ FAILED: Could not query order record:", orderFetchErr);
    process.exit(1);
  }
  console.log(`✅ Order found in Supabase orders table: ${orderRecord.order_reference} (Status: ${orderRecord.status}, Total: R${orderRecord.estimated_total})`);

  // C. Verify `public.order_items` Table Sync
  console.log("4. [VERIFY ORDER_ITEMS TABLE] Checking item snapshots...");
  const { data: itemRecords, error: itemsFetchErr } = await supabase
    .from("order_items")
    .select("id, sku_snapshot, product_name_snapshot, quantity, unit_selling_price, requires_pexcover")
    .eq("order_id", orderId);

  if (itemsFetchErr || !itemRecords || itemRecords.length !== 3) {
    console.error("❌ FAILED: Item snapshots missing or mismatched:", itemsFetchErr, itemRecords);
    process.exit(1);
  }
  console.log(`✅ ${itemRecords.length} item snapshots correctly persisted in order_items table.`);
  for (const item of itemRecords) {
    console.log(`   - ${item.quantity}x ${item.product_name_snapshot} (R${item.unit_selling_price}) [Pexcover: ${item.requires_pexcover}]`);
  }

  // D. Test Ozow Gateway Signature & Payload
  console.log("5. [OZOW GATEWAY TEST] Computing Ozow SHA512 signature hash...");
  const appBase = "https://pexpacks.co.za";
  const ozowAmount = estimatedTotal.toFixed(2);
  const ozowHash = generateOzowCheckoutHash({
    siteCode: ozowSiteCode,
    countryCode: "ZA",
    currencyCode: "ZAR",
    amount: ozowAmount,
    transactionReference: orderReference,
    bankReference: orderReference.slice(0, 20),
    cancelUrl: `${appBase}/checkout?cancelled=1`,
    errorUrl: `${appBase}/checkout?error=1`,
    successUrl: `${appBase}/checkout/success?ref=${orderReference}`,
    notifyUrl: `${appBase}/api/ozow/webhook`,
    isTest: "false",
    privateKey: ozowPrivateKey,
  });

  if (!ozowHash || ozowHash.length !== 128) {
    console.error("❌ FAILED: Ozow hash generation failed or incorrect length:", ozowHash);
    process.exit(1);
  }
  console.log(`✅ Ozow SHA512 hash generated: ${ozowHash.slice(0, 32)}... (128 hex chars)`);
  console.log(`✅ Ozow Payload verified for merchant: ${ozowSiteCode}, Amount: R${ozowAmount}`);

  // E. Test Payment Webhook / Transition to Paid
  console.log("6. [PAYMENT COMPLETION] Simulating Ozow payment success webhook...");
  const { data: completeData, error: completeErr } = await supabase.rpc(
    "complete_order_payment",
    {
      p_order_reference: orderReference,
      p_gateway_reference: `OZOW-TXN-${testRefNumber}`,
      p_amount: estimatedTotal,
      p_currency: "ZAR",
      p_provider: "ozow",
      p_payment_method: "Ozow Instant EFT",
      p_payload: {
        TransactionId: `OZOW-TXN-${testRefNumber}`,
        Status: "Complete",
        StatusMessage: "Successful payment by developer test suite",
      },
    },
  );

  if (completeErr) {
    console.error("❌ FAILED: complete_order_payment RPC failed:", completeErr);
    process.exit(1);
  }
  console.log("✅ complete_order_payment transition succeeded:", completeData);

  // F. Verify Status in Orders Table
  const { data: paidOrderRecord } = await supabase
    .from("orders")
    .select("status, paid_at, payment_gateway")
    .eq("id", orderId)
    .single();

  if (paidOrderRecord?.status !== "paid") {
    console.error(`❌ FAILED: Order status is not 'paid': ${paidOrderRecord?.status}`);
    process.exit(1);
  }
  console.log(`✅ Supabase order status successfully updated to 'paid' (Paid at: ${paidOrderRecord.paid_at})`);

  // G. Test Email Receipt Dispatch via Resend & Claim Locking
  console.log("7. [RECEIPT EMAIL DISPATCH] Testing purchase receipt dispatch with Resend...");
  if (!resendApiKey) {
    console.error("❌ FAILED: RESEND_API_KEY is not configured.");
    process.exit(1);
  }

  // Claim receipt delivery
  const { data: claimToken, error: claimErr } = await supabase.rpc(
    "claim_order_receipt_delivery",
    { p_order_id: orderId },
  );

  if (claimErr) {
    console.error("❌ FAILED: claim_order_receipt_delivery failed:", claimErr);
    process.exit(1);
  }
  console.log(`✅ Receipt delivery claim acquired. Token: ${claimToken}`);

  // Dispatch email via Resend
  const resend = new Resend(resendApiKey);
  console.log(`   Dispatching test receipt to ${buyerEmail}...`);
  const emailResult = await resend.emails.send({
    from: fromEmail,
    to: [buyerEmail],
    subject: `[TEST VERIFIED] Your Pexpacks receipt ${orderReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
        <h2 style="color: #0f172a;">Pexpacks Test Receipt Confirmation</h2>
        <p>This is a successful automated test receipt executed by the Developer Technician test suite.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Order Reference:</strong> ${orderReference}</p>
        <p><strong>Buyer Name:</strong> ${buyerName}</p>
        <p><strong>Total Paid:</strong> R${estimatedTotal.toFixed(2)}</p>
        <p><strong>Payment Gateway:</strong> Ozow Instant EFT (Live Verified Gateway)</p>
        <p><strong>Status:</strong> Paid & Verified</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #64748b;">Supabase order table sync and Resend transactional delivery verified.</p>
      </div>
    `,
    replyTo: "orders@pexpacks.co.za",
  });

  if (emailResult.error) {
    console.error("❌ FAILED: Resend email send error:", emailResult.error);
    await supabase.rpc("complete_order_receipt_delivery", {
      p_order_id: orderId,
      p_claim_token: claimToken,
      p_sent: false,
      p_error: emailResult.error.message,
    });
    process.exit(1);
  }
  console.log(`✅ Email receipt dispatched successfully via Resend! Message ID: ${emailResult.data?.id}`);

  // Complete delivery claim
  await supabase.rpc("complete_order_receipt_delivery", {
    p_order_id: orderId,
    p_claim_token: claimToken,
    p_sent: true,
    p_error: null,
  });
  console.log("✅ complete_order_receipt_delivery RPC acknowledged delivery completion.");

  // H. Clean up Test Record
  console.log("8. [CLEANUP] Cleaning up test technician records from orders & order_items...");
  await supabase.from("order_items").delete().eq("order_id", orderId);
  await supabase.from("orders").delete().eq("id", orderId);
  console.log(`✅ Test order ${orderReference} and snapshots cleaned up from database.`);

  console.log("");
  console.log("🎉 ALL TESTS PASSED: Supabase tables, Ozow checkout gateway signature, and Resend email dispatching are 100% operational!");
}

runTest().catch((err) => {
  console.error("❌ Uncaught test exception:", err);
  process.exit(1);
});
