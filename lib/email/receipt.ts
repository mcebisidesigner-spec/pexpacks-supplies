import { Resend } from "resend";
import { formatCurrency } from "@/lib/formatCurrency";

export type ReceiptOrder = {
  order_reference: string;
  status: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string;
  learner_name: string | null;
  school_name: string;
  grade: string;
  pack_type: string;
  items: unknown;
  estimated_total: number | null;
  fulfilment_option: string | null;
  payment_gateway: string | null;
  gateway_reference: string | null;
  paid_at: string | null;
  metadata: unknown;
  created_at: string;
};

type GatewayMeta =
  | Record<string, string | number | boolean | null>
  | undefined;

function asGatewayMeta(value: unknown): GatewayMeta {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as GatewayMeta;
  }
  return undefined;
}

function paymentMethodLabel(order: ReceiptOrder): string {
  const gateway = order.payment_gateway ?? "";
  const meta = asGatewayMeta(
    order.metadata && typeof order.metadata === "object"
      ? (order.metadata as Record<string, unknown>).gateway
      : undefined
  );

  if (gateway === "ozow") {
    if (meta?.method === "HappyPay") {
      return "Happy Pay (2 x interest-free instalments)";
    }
    return "Ozow (Pay Now)";
  }

  if (gateway) {
    return gateway.charAt(0).toUpperCase() + gateway.slice(1);
  }

  return "Pending";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderItems(order: ReceiptOrder): string {
  const items = order.items;

  if (Array.isArray(items) && items.length > 0) {
    const rows = items
      .map((item) => {
        if (typeof item !== "string") return "";
        if (item === "---") {
          return `<tr><td colspan="2" style="padding:6px 0;border-bottom:1px solid #e9ecf1;">&nbsp;</td></tr>`;
        }
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eef1f6;color:#33475b;font-size:14px;line-height:1.5;">${escapeHtml(item)}</td>
        </tr>`;
      })
      .filter(Boolean)
      .join("");

    return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
  }

  return `<p style="color:#66788f;font-size:14px;">No itemised breakdown available.</p>`;
}

function buildReceiptHtml(order: ReceiptOrder): string {
  const total = order.estimated_total ?? 0;
  const itemsHtml = renderItems(order);

  return `<!doctype html>
<html lang="en-ZA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Pexpacks Receipt</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(26,42,64,0.08);">
                <div style="background:#1a7a77;padding:24px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Pexpacks</h1>
                  <p style="margin:6px 0 0;color:#d9f2f1;font-size:13px;">Payment Receipt &amp; Order Confirmation</p>
                </div>
                <div style="padding:32px;">
                  <p style="margin:0 0 4px;color:#33475b;font-size:16px;font-weight:700;">
                    Thank you for your order, ${escapeHtml(order.buyer_name)}!
                  </p>
                  <p style="margin:0 0 20px;color:#66788f;font-size:14px;">
                    Your payment was successful and we have started preparing your packs.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr>
                      <td style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#66788f;">Order reference</td>
                      <td style="padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:13px;font-weight:700;color:#1a2a40;text-align:right;">${escapeHtml(order.order_reference)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;font-size:13px;color:#66788f;">Date</td>
                      <td style="padding:10px 12px;font-size:13px;color:#1a2a40;text-align:right;">${escapeHtml(formatDate(order.paid_at || order.created_at))}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;font-size:13px;color:#66788f;">Payment method</td>
                      <td style="padding:10px 12px;font-size:13px;color:#1a2a40;text-align:right;">${escapeHtml(paymentMethodLabel(order))}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;font-size:13px;color:#66788f;">School</td>
                      <td style="padding:10px 12px;font-size:13px;color:#1a2a40;text-align:right;">${escapeHtml(order.school_name)}${order.grade ? ` &middot; ${escapeHtml(order.grade)}` : ""}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 12px;font-size:13px;color:#66788f;">Fulfilment</td>
                      <td style="padding:10px 12px;font-size:13px;color:#1a2a40;text-align:right;">${escapeHtml(order.fulfilment_option || "To be confirmed")}</td>
                    </tr>
                  </table>

                  <h2 style="margin:0 0 12px;color:#1a2a40;font-size:15px;font-weight:700;">Order summary</h2>
                  ${itemsHtml}

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border-top:2px solid #1a2a40;padding-top:14px;">
                    <tr>
                      <td style="color:#33475b;font-size:15px;font-weight:700;">Total paid</td>
                      <td style="color:#1a7a77;font-size:18px;font-weight:800;text-align:right;">${escapeHtml(formatCurrency(total))}</td>
                    </tr>
                  </table>

                  <div style="margin:28px 0 0;padding:16px;background:#f0fbfa;border:1px solid #cdeeea;border-radius:10px;">
                    <p style="margin:0 0 6px;color:#1a7a77;font-size:14px;font-weight:700;">What happens next?</p>
                    <p style="margin:0;color:#33475b;font-size:13px;line-height:1.6;">
                      We will be in touch shortly with your order updates and delivery details. For Happy Pay orders,
                      your second instalment of 50% is managed directly by Happy Pay.
                    </p>
                  </div>

                  <p style="margin:24px 0 0;color:#9aa7b8;font-size:12px;line-height:1.6;">
                    Need help? Email <a href="mailto:helpme@pexpacks.co.za" style="color:#1a7a77;">helpme@pexpacks.co.za</a> or
                    call <a href="tel:0780036048" style="color:#1a7a77;">078 003 6048</a>.<br />
                    Pexpacks Supplies &middot; Pexcover book-covering &middot; School stationery packs
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPurchaseReceipt(
  order: ReceiptOrder
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not configured. Skipping receipt email for",
      order.order_reference
    );
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!order.buyer_email) {
    console.warn(
      "[email] Order has no buyer email. Skipping receipt for",
      order.order_reference
    );
    return { success: false, error: "No buyer email" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Pexpacks <orders@pexpacks.co.za>";

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [order.buyer_email],
    bcc: ["orders@pexpacks.co.za", "pexpacks@gmail.com"],
    subject: `Your Pexpacks receipt ${order.order_reference}`,
    html: buildReceiptHtml(order),
    replyTo: process.env.RESEND_REPLY_TO_EMAIL || "helpme@pexpacks.co.za",
  });

  if (error) {
    console.error(
      "[email] Failed to send receipt for",
      order.order_reference,
      JSON.stringify(error)
    );
    return { success: false, error: error.message };
  }

  console.log("[email] Receipt sent for", order.order_reference);
  return { success: true };
}
