import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { FormEndpointKind } from "@/lib/forms/types";

type SendPexPacksEmailInput = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  formType: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  metadata?: Record<string, string | number | boolean | undefined>;
};

type SendPexPacksEmailResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  defaultReplyTo?: string;
};

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null =
  null;
let transporterKey = "";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required SMTP environment variable: ${name}`);
  }

  return value;
}

function readSmtpConfig(): SmtpConfig {
  const port = Number(requiredEnv("SMTP_PORT"));

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid positive number.");
  }

  return {
    host: requiredEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE === "true",
    user: requiredEnv("SMTP_USER"),
    pass: requiredEnv("SMTP_PASS"),
    fromEmail: requiredEnv("SMTP_FROM_EMAIL"),
    fromName: process.env.SMTP_FROM_NAME?.trim() || "PexPacks Website",
    defaultReplyTo: process.env.SMTP_REPLY_TO_EMAIL?.trim(),
  };
}

function getTransporter(config: SmtpConfig) {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}`;

  if (!transporter || transporterKey !== key) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    transporterKey = key;
  }

  return transporter;
}

export function recipientForEndpoint(endpoint: FormEndpointKind) {
  if (endpoint === "order") {
    return process.env.SMTP_ORDERS_TO_EMAIL || process.env.SMTP_TO_EMAIL;
  }

  if (endpoint === "quote") {
    return process.env.SMTP_QUOTES_TO_EMAIL || process.env.SMTP_TO_EMAIL;
  }

  if (endpoint === "school-partnership") {
    return process.env.SMTP_PARTNERSHIPS_TO_EMAIL || process.env.SMTP_TO_EMAIL;
  }

  if (endpoint === "office-pack") {
    return process.env.SMTP_OFFICE_PACKS_TO_EMAIL || process.env.SMTP_TO_EMAIL;
  }

  return process.env.SMTP_CONTACT_TO_EMAIL || process.env.SMTP_TO_EMAIL;
}

export async function sendPexPacksEmail({
  to,
  replyTo,
  subject,
  text,
  html,
  formType,
  attachments,
  metadata,
}: SendPexPacksEmailInput): Promise<SendPexPacksEmailResult> {
  try {
    const config = readSmtpConfig();
    const result = await getTransporter(config).sendMail({
      to,
      from: `"${config.fromName}" <${config.fromEmail}>`,
      replyTo: replyTo || config.defaultReplyTo || config.fromEmail,
      subject,
      text,
      html,
      attachments,
      headers: {
        "X-PexPacks-Form-Type": formType,
        ...(metadata?.sourceUrl
          ? { "X-PexPacks-Source-Url": String(metadata.sourceUrl) }
          : {}),
      },
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(
      "[SMTP] Form email failed:",
      error instanceof Error ? error.message : "Unknown SMTP error"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP send failed.",
    };
  }
}
