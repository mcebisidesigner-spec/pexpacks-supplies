import { Resend } from "resend";
import { emailLegalNoticeHtml } from "@/lib/email/legalNotice";

export type StatusUpdateOrder = {
  order_reference: string;
  buyer_email: string | null;
  buyer_name: string;
  tracking_token?: string | null;
  status: string;
  courier_name?: string | null;
  waybill_number?: string | null;
  estimated_delivery?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Payment Confirmed",
  scheduled: "Scheduled for Packing",
  not_ready: "Awaiting Items",
  packing: "Being Packed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

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
  return `${day} ${month} ${year}`;
}

function buildStatusEmailHtml(order: StatusUpdateOrder): string {
  const label = STATUS_LABELS[order.status] || order.status;
  const encodedEmail = encodeURIComponent(order.buyer_email || "");
  const token = encodeURIComponent(order.tracking_token || "");
  const trackingUrl = `https://pexpacks.co.za/track-order?ref=${encodeURIComponent(order.order_reference)}&email=${encodedEmail}&token=${token}`;

  const courierBlock =
    order.courier_name || order.waybill_number
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:separate;border-spacing:0 2px;">
          ${order.courier_name ? `<tr><td style="padding:12px 18px;background:#f8fafc;border-top-left-radius:10px;font-size:14px;color:#64748b;font-weight:500;">Courier</td><td style="padding:12px 18px;background:#f8fafc;border-top-right-radius:10px;font-size:14px;font-weight:700;color:#1e293b;text-align:right;">${escapeHtml(order.courier_name)}</td></tr>` : ""}
          ${order.waybill_number ? `<tr><td style="padding:12px 18px;background:#f8fafc;${!order.courier_name ? "border-top-left-radius:10px;" : ""}font-size:14px;color:#64748b;font-weight:500;">Waybill</td><td style="padding:12px 18px;background:#f8fafc;${!order.courier_name ? "border-top-right-radius:10px;" : ""}font-size:14px;font-weight:700;color:#1e293b;text-align:right;">${escapeHtml(order.waybill_number)}</td></tr>` : ""}
        </table>`
      : "";

  const deliveryBlock = order.estimated_delivery
    ? `<p style="margin:12px 0 0;color:#33475b;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
        Estimated delivery: <strong>${escapeHtml(formatDate(order.estimated_delivery))}</strong>
      </p>`
    : "";

  return `<!doctype html>
<html lang="en-ZA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order Status Update</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
                <!-- Header -->
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
                      <div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:15px;font-weight:500;line-height:1.35;">Order</div>
                      <div style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:17px;font-weight:800;line-height:1.35;">Status Update</div>
                    </td>
                  </tr>
                </table>
                <div style="height:4px;background:#219e9b;width:100%;"></div>

                <!-- Body -->
                <div style="padding:32px;">
                  <h2 style="margin:0 0 8px;color:#1e293b;font-size:17px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">
                    Hi ${escapeHtml(order.buyer_name)},
                  </h2>
                  <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                    Your order <strong>${escapeHtml(order.order_reference)}</strong> has been updated.
                  </p>

                  <!-- Status Badge -->
                  <div style="margin:20px 0;text-align:center;">
                    <span style="display:inline-block;padding:12px 28px;background:#219e9b;color:#ffffff;border-radius:30px;font-weight:800;font-size:16px;font-family:Arial,Helvetica,sans-serif;">
                      ${escapeHtml(label)}
                    </span>
                  </div>

                  ${courierBlock}
                  ${deliveryBlock}

                  <!-- Track Order Button -->
                  <div style="margin:24px 0;text-align:center;">
                    <a href="${trackingUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#219e9b;color:#ffffff;text-decoration:none;border-radius:30px;font-weight:800;font-size:15px;box-shadow:0 4px 12px rgba(33,158,155,0.25);">
                      <u>Track your order</u>
                    </a>
                  </div>

                  <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;font-family:Arial,Helvetica,sans-serif;">
                    Need help? Email <a href="mailto:care@pexpacks.co.za" style="color:#219e9b;text-decoration:none;font-weight:600;">care@pexpacks.co.za</a> or
                    call <a href="tel:0780036048" style="color:#219e9b;text-decoration:none;font-weight:600;">078 003 6048</a>.<br />
                    Pexpacks Supplies &middot; Pexcover book-covering &middot; School stationery packs
                  </p>
                  ${emailLegalNoticeHtml}
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

export async function sendOrderStatusUpdate(
  order: StatusUpdateOrder
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured. Skipping status update for", order.order_reference);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!order.buyer_email) {
    return { success: false, error: "No buyer email" };
  }

  const label = STATUS_LABELS[order.status] || order.status;
  const from = process.env.RESEND_FROM_EMAIL || "Pexpacks <orders@pexpacks.co.za>";
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [order.buyer_email],
    bcc: ["orders@pexpacks.co.za"],
    subject: `Order ${order.order_reference} — ${label}`,
    html: buildStatusEmailHtml(order),
    replyTo: process.env.RESEND_REPLY_TO_EMAIL || "care@pexpacks.co.za",
  });

  if (error) {
    console.error("[email] Failed to send status update for", order.order_reference, JSON.stringify(error));
    return { success: false, error: error.message };
  }

  return { success: true };
}
