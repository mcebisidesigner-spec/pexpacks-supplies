import { Resend } from "resend";
import { emailLegalNoticeHtml } from "@/lib/email/legalNotice";

export interface OrderDeletionArchiveParams {
  order: Record<string, unknown>;
  payments: Record<string, unknown>[];
  deletedBy: string;
}

export async function sendOrderDeletionArchiveEmail({
  order,
  payments,
  deletedBy,
}: OrderDeletionArchiveParams): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[order-deletion-archive] RESEND_API_KEY not configured. Skipping email.");
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const resend = new Resend(apiKey);

  const orderRef = String(order.order_reference ?? order.id ?? "UNKNOWN");
  const buyerName = String(order.buyer_name ?? "Customer");
  const buyerEmail = String(order.buyer_email ?? "N/A");
  const buyerPhone = String(order.buyer_phone ?? "N/A");
  const schoolName = String(order.school_name ?? "N/A");
  const grade = String(order.grade ?? "N/A");
  const total = order.estimated_total != null ? `R ${Number(order.estimated_total).toFixed(2)}` : "R 0.00";
  const status = String(order.status ?? "unknown");
  const deletedAt = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Deletion Archive Notice</title>
</head>
<body style="margin:0; padding:0; background-color:#020617; font-family: Arial, Helvetica, sans-serif; color:#cbd5e1;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#020617; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px; max-width:640px; background-color:#0f172a; border-radius:16px; border:1px solid #1e293b; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#020617; padding: 20px 28px; border-bottom:1px solid #1e293b;">
              <span style="font-size:22px; font-weight:800; color:#ffffff;">Pexpacks</span>
              <span style="font-size:13px; font-weight:700; color:#f87171; margin-left:8px; text-transform:uppercase; letter-spacing:0.05em;">Order Deleted Archive</span>
            </td>
          </tr>

          <!-- Notice Banner -->
          <tr>
            <td style="padding: 24px 28px; background-color: rgba(239, 68, 68, 0.1); border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
              <h1 style="margin:0 0 8px; font-size:18px; font-weight:800; color:#f87171;">⚠️ Order Data Permanent Deletion Archive</h1>
              <p style="margin:0; font-size:13px; color:#cbd5e1; line-height:1.5;">
                Order <strong>${orderRef}</strong> has been deleted from the active database by <strong>${deletedBy}</strong> on <strong>${deletedAt}</strong>. Below is the complete archived snapshot of all primary order attributes, gateway transactions, and metadata.
              </p>
            </td>
          </tr>

          <!-- Primary Order Details -->
          <tr>
            <td style="padding: 24px 28px;">
              <h2 style="margin:0 0 14px; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8;">1. Primary Order Record</h2>
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color:#020617; border-radius:12px; border:1px solid #1e293b; font-size:13px; color:#cbd5e1;">
                <tr>
                  <td width="35%" style="color:#94a3b8; font-weight:600; border-bottom:1px solid #1e293b;">Order Reference:</td>
                  <td style="color:#ffffff; font-weight:800; font-family:monospace; border-bottom:1px solid #1e293b;">${orderRef}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8; font-weight:600; border-bottom:1px solid #1e293b;">Buyer Name:</td>
                  <td style="color:#ffffff; font-weight:700; border-bottom:1px solid #1e293b;">${buyerName}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8; font-weight:600; border-bottom:1px solid #1e293b;">Buyer Contact:</td>
                  <td style="border-bottom:1px solid #1e293b;">${buyerEmail} | ${buyerPhone}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8; font-weight:600; border-bottom:1px solid #1e293b;">School & Grade:</td>
                  <td style="border-bottom:1px solid #1e293b;">${schoolName} (${grade})</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8; font-weight:600; border-bottom:1px solid #1e293b;">Order Total:</td>
                  <td style="color:#34d399; font-weight:800; border-bottom:1px solid #1e293b;">${total}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8; font-weight:600;">Status prior to deletion:</td>
                  <td style="color:#fbbf24; font-weight:700;">${status}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Associated Gateway Payments -->
          <tr>
            <td style="padding: 0 28px 24px;">
              <h2 style="margin:0 0 14px; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8;">2. Gateway Payments & Transactions (${payments.length})</h2>
              ${
                payments.length > 0
                  ? `
                <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color:#020617; border-radius:12px; border:1px solid #1e293b; font-size:12px; color:#cbd5e1;">
                  <thead>
                    <tr style="background-color:#1e293b; color:#ffffff; font-weight:700;">
                      <th align="left">Gateway</th>
                      <th align="left">Reference</th>
                      <th align="left">Amount</th>
                      <th align="left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${payments
                      .map(
                        (p) => `
                      <tr>
                        <td style="border-bottom:1px solid #1e293b;">${String(p.payment_gateway || p.gateway || "N/A")}</td>
                        <td style="border-bottom:1px solid #1e293b; font-family:monospace;">${String(p.gateway_reference || p.payment_reference || "N/A")}</td>
                        <td style="border-bottom:1px solid #1e293b;">R ${Number(p.amount || p.estimated_total || 0).toFixed(2)}</td>
                        <td style="border-bottom:1px solid #1e293b; color:#34d399;">${String(p.status || "N/A")}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : `<div style="background-color:#020617; border-radius:12px; padding:12px 16px; border:1px solid #1e293b; font-size:12px; color:#94a3b8;">No gateway transaction records were linked to this order reference.</div>`
              }
            </td>
          </tr>

          <!-- Full JSON Metadata & Raw Order Dump -->
          <tr>
            <td style="padding: 0 28px 28px;">
              <h2 style="margin:0 0 14px; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8;">3. Full Raw JSON Metadata Dump</h2>
              <pre style="margin:0; background-color:#020617; padding:16px; border-radius:12px; border:1px solid #1e293b; font-size:11px; font-family:monospace; color:#38bdf8; overflow-x:auto; white-space:pre-wrap; word-break:break-all;">${escapeHtml(
                JSON.stringify(
                  {
                    order,
                    payments,
                    deletedBy,
                    deletedAt,
                  },
                  null,
                  2
                )
              )}</pre>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#020617; padding: 16px 28px 0; text-align:left;">
              ${emailLegalNoticeHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:#020617; padding: 16px 28px; border-top:1px solid #1e293b; text-align:center; font-size:11px; color:#64748b;">
              Pexpacks Admin Security System · Automated Archive Dispatch · orders@pexpacks.co.za &amp; mcebisi@pexpacks.co.za
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: "Pexpacks Admin <orders@pexpacks.co.za>",
      to: ["helpme@pexpacks.co.za", "pexpacks@gmail.com"],
      subject: `[ORDER DELETED ARCHIVE] ${orderRef} — ${buyerName}`,
      html,
      text: `Order Deletion Archive Notice:\nOrder ${orderRef} (${buyerName}, ${total}) was deleted by ${deletedBy} on ${deletedAt}.\nAll associated payment and order metadata records have been permanently purged from active tables.`,
    });

    if (data.error) {
      console.error("[order-deletion-archive] Resend dispatch failed:", data.error);
      return { ok: false, error: data.error.message };
    }

    return { ok: true, messageId: data.data?.id };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[order-deletion-archive] Exception dispatching archive email:", errMsg);
    return { ok: false, error: errMsg };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
