import { Resend } from "resend";
import { formatCurrency } from "@/lib/formatCurrency";

export type ReceiptOrder = {
  order_reference: string;
  unique_customer_id?: string | null;
  tracking_token?: string | null;
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
  const day = date.getDate();
  const month = date.toLocaleString("en-ZA", { month: "long" });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hours}:${minutes}`;
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
  const encodedEmail = encodeURIComponent(order.buyer_email || "");
  const token = encodeURIComponent(order.tracking_token || "");
  const trackingUrl = `https://pexpacks.co.za/track-order?ref=${encodeURIComponent(order.order_reference)}&email=${encodedEmail}&token=${token}`;

  return `<!doctype html>
<html lang="en-ZA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Pexpacks Receipt</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
                <!-- Header Block -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#152338;">
                  <tr>
                    <td style="padding:28px 32px;vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;padding-right:12px;">
                            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 3L35 12V28L20 37L5 28V12L20 3Z" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
                              <circle cx="20" cy="20" r="6" fill="#FFFFFF"/>
                              <path d="M20 8V14M20 26V32M8 20H14M26 20H32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </td>
                          <td style="vertical-align:middle;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#ffffff;line-height:1.1;display:block;">Pexpacks</span>
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:#ffffff;line-height:1.1;display:block;">Supplies</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="padding:28px 32px;text-align:right;vertical-align:middle;">
                      <div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:15px;font-weight:500;line-height:1.35;">Payment Receipt &amp;</div>
                      <div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:17px;font-weight:800;line-height:1.35;">Order Confirmation</div>
                    </td>
                  </tr>
                </table>
                <div style="height:4px;background:#219e9b;width:100%;"></div>

                <!-- Body Content -->
                <div style="padding:32px;">
                  <h2 style="margin:0 0 8px;color:#1e293b;font-size:17px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">
                    Thank you for your order, ${escapeHtml(order.buyer_name)}!
                  </h2>
                  <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                    Your payment was successful and we have started preparing your packs.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:0 2px;">
                    <tr>
                      <td style="padding:14px 18px;background:#f8fafc;border-top-left-radius:10px;border-bottom-left-radius:10px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Order reference</td>
                      <td style="padding:14px 18px;background:#f8fafc;border-top-right-radius:10px;border-bottom-right-radius:10px;font-size:14px;font-weight:800;color:#1e293b;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(order.order_reference)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Customer email</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(order.buyer_email || "N/A")}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Unique customer ID</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(order.unique_customer_id || "CUST-GUEST")}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Date</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(formatDate(order.paid_at || order.created_at))}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Payment method</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(paymentMethodLabel(order))}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">School</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(order.school_name)}${order.grade ? ` &middot; ${escapeHtml(order.grade)}` : ""}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 18px;font-size:14px;color:#64748b;font-weight:500;font-family:Arial,Helvetica,sans-serif;">Fulfilment</td>
                      <td style="padding:12px 18px;font-size:14px;color:#334155;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(order.fulfilment_option || "To be confirmed")}</td>
                    </tr>
                  </table>

                  <!-- Track Order Magic Link Button -->
                  <div style="margin:20px 0 28px;text-align:center;">
                    <a href="${trackingUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#219e9b;color:#ffffff;text-decoration:none;border-radius:30px;font-weight:800;font-size:15px;box-shadow:0 4px 12px rgba(33,158,155,0.25);">
                      <u>Click to track your order</u>
                    </a>
                  </div>

                  <h3 style="margin:24px 0 12px;color:#1e293b;font-size:15px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">Order summary</h3>
                  ${itemsHtml}

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-top:2px solid #1e293b;padding-top:16px;">
                    <tr>
                      <td style="color:#1e293b;font-size:15px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">Total paid</td>
                      <td style="color:#219e9b;font-size:18px;font-weight:800;text-align:right;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(formatCurrency(total))}</td>
                    </tr>
                  </table>

                  <div style="margin:28px 0 0;padding:18px;background:#f0fbfa;border:1px solid #cdeeea;border-radius:12px;">
                    <p style="margin:0 0 6px;color:#1a7a77;font-size:14px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">What happens next?</p>
                    <p style="margin:0;color:#33475b;font-size:13px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
                      We will be in touch shortly with your order updates and delivery details. For Happy Pay orders,
                      your second instalment of 50% is managed directly by Happy Pay.
                    </p>
                  </div>

                  <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;font-family:Arial,Helvetica,sans-serif;">
                    Need help? Email <a href="mailto:helpme@pexpacks.co.za" style="color:#219e9b;text-decoration:none;font-weight:600;">helpme@pexpacks.co.za</a> or
                    call <a href="tel:0780036048" style="color:#219e9b;text-decoration:none;font-weight:600;">078 003 6048</a>.<br />
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

  return { success: true };
}
