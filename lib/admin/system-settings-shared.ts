export type SettingValueType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "email"
  | "percentage"
  | "currency";

export type SettingScope = "global" | "season" | "school" | "category" | "product";

export interface SystemSettingDefinition {
  key: string;
  category: SystemSettingCategory;
  label: string;
  description: string;
  valueType: SettingValueType;
  scope: SettingScope;
  isSensitive: boolean;
  isPublic: boolean;
  requiresApproval: boolean;
  defaultValue: unknown;
  options?: { value: string; label: string }[];
}

export type SystemSettingCategory =
  | "overview"
  | "add_users"
  | "general"
  | "business"
  | "pricing"
  | "seasons"
  | "orders"
  | "payments"
  | "procurement"
  | "fulfilment"
  | "suppliers"
  | "notifications"
  | "integrations"
  | "data"
  | "security"
  | "performance"
  | "flags"
  | "audit"
  | "system_info";

export const SYSTEM_SETTING_CATEGORIES: {
  key: SystemSettingCategory;
  label: string;
  description: string;
  iconName: string;
}[] = [
  { key: "overview", label: "Overview", description: "Control centre dashboard & system health", iconName: "LayoutDashboard" },
  { key: "add_users", label: "Add Users", description: "Onboard new administrative staff & send email invitations", iconName: "UserPlus" },
  { key: "general", label: "General", description: "Brand name, site URL, and regional defaults", iconName: "Globe" },
  { key: "business", label: "Business Identity", description: "Legal entity, contact emails, and helpline numbers", iconName: "Building2" },
  { key: "pricing", label: "Pricing & Margin", description: "Markup/margin rules, warning floors, and rounding strategy", iconName: "BadgePercent" },
  { key: "seasons", label: "Schools & Seasons", description: "Active Back-to-School season & operational windows", iconName: "Calendar" },
  { key: "orders", label: "Orders & Checkout", description: "Order status rules, timeout limits, & checkout defaults", iconName: "ShoppingBag" },
  { key: "payments", label: "Payment Gateways", description: "Ozow, Happy Pay, & bank transfer integration controls", iconName: "CreditCard" },
  { key: "procurement", label: "Procurement Rules", description: "Paid-order procurement triggers & allocation priorities", iconName: "PackageSearch" },
  { key: "fulfilment", label: "Packing & Dispatch", description: "Packing readiness rules & customer notification triggers", iconName: "Truck" },
  { key: "suppliers", label: "Supplier Defaults", description: "Lead-time warnings, stale-offer limits, & RFQ defaults", iconName: "Factory" },
  { key: "notifications", label: "Notifications & Email", description: "Operational dashboard alerts & customer transactional emails", iconName: "Bell" },
  { key: "integrations", label: "Integrations & APIs", description: "Supabase, Vercel, Resend, & payment provider health", iconName: "Cpu" },
  { key: "data", label: "Data Management", description: "Data imports, export tools, & dry-run restore center", iconName: "Database" },
  { key: "security", label: "Security & Access", description: "RBAC roles, admin idle timeouts, & access auditing", iconName: "ShieldCheck" },
  { key: "performance", label: "Database Performance", description: "Query latencies, connection counts, & index recommendations", iconName: "Activity" },
  { key: "flags", label: "Feature Flags", description: "Controlled feature rollout toggles with safety confirmations", iconName: "ToggleRight" },
  { key: "audit", label: "Audit & History", description: "Immutable log of all system configuration modifications", iconName: "History" },
  { key: "system_info", label: "System Info", description: "Read-only application & environment status", iconName: "Server" },
];

export const SYSTEM_SETTING_DEFINITIONS: SystemSettingDefinition[] = [
  // General
  { key: "general.site_name", category: "general", label: "Site Name", description: "Primary customer-facing brand name", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "Pexpacks" },
  { key: "general.site_url", category: "general", label: "Canonical Site URL", description: "Official web application canonical base URL", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "https://pexpacks.co.za" },
  { key: "general.locale", category: "general", label: "Default Locale", description: "Language and regional format code", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "en-ZA" },
  { key: "general.timezone", category: "general", label: "Timezone", description: "Default server and reporting timezone", valueType: "string", scope: "global", isSensitive: false, isPublic: false, requiresApproval: false, defaultValue: "Africa/Johannesburg" },

  // Business Identity
  { key: "business.trading_name", category: "business", label: "Legal Trading Name", description: "Registered corporate legal entity name", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "Pexpacks Supplies (Pty) Ltd" },
  { key: "business.support_email", category: "business", label: "Customer Support Email", description: "Primary public customer service email address", valueType: "email", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "helpme@pexpacks.co.za" },
  { key: "business.legal_email", category: "business", label: "Legal & POPIA Email", description: "POPIA compliance & legal notice email address", valueType: "email", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "helpme@pexpacks.co.za" },
  { key: "business.support_phone", category: "business", label: "Support Telephone", description: "Public customer helpline telephone number", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "0780036048" },
  { key: "business.whatsapp_number", category: "business", label: "WhatsApp Support Number", description: "Direct WhatsApp support channel phone number", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "27780036048" },

  // Pricing & Margin
  { key: "pricing.default_method", category: "pricing", label: "Default Pricing Method", description: "Base calculation method for suggested selling prices", valueType: "string", scope: "global", isSensitive: true, isPublic: false, requiresApproval: true, defaultValue: "margin", options: [{ value: "margin", label: "Gross Margin %" }, { value: "markup", label: "Cost Markup %" }] },
  { key: "pricing.target_margin_pct", category: "pricing", label: "Target Gross Margin %", description: "Target gross margin percentage applied to cost prices", valueType: "percentage", scope: "global", isSensitive: true, isPublic: false, requiresApproval: true, defaultValue: 32.0 },
  { key: "pricing.low_margin_warning_pct", category: "pricing", label: "Low Margin Alert %", description: "Threshold percentage below which items trigger low-margin alerts", valueType: "percentage", scope: "global", isSensitive: false, isPublic: false, requiresApproval: false, defaultValue: 20.0 },
  { key: "pricing.critical_margin_pct", category: "pricing", label: "Critical Margin Floor %", description: "Minimum allowable margin percentage requiring Superuser approval", valueType: "percentage", scope: "global", isSensitive: true, isPublic: false, requiresApproval: true, defaultValue: 10.0 },
  { key: "pricing.verify_days", category: "pricing", label: "Price Verification Period", description: "Days before supplier catalog prices are flagged as unverified/stale", valueType: "number", scope: "global", isSensitive: false, isPublic: false, requiresApproval: false, defaultValue: 90 },
  { key: "pricing.pexcover_price", category: "pricing", label: "PexCover Item Price (R)", description: "Standalone unit price for optional PexCover insurance protection", valueType: "currency", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: 350.0 },

  // Seasons
  { key: "seasons.active_season", category: "seasons", label: "Active Commercial Season", description: "Default Back-to-School operational season driving catalog & dashboards", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: true, defaultValue: "2027 Back-to-School" },

  // Orders
  { key: "orders.default_fulfilment", category: "orders", label: "Default Fulfilment Option", description: "Default selected delivery method on customer checkout form", valueType: "string", scope: "global", isSensitive: false, isPublic: true, requiresApproval: false, defaultValue: "School collection", options: [{ value: "School collection", label: "School collection" }, { value: "Home delivery", label: "Home delivery" }] },
  { key: "orders.idle_timeout_mins", category: "orders", label: "Admin Inactivity Timeout (Mins)", description: "Minutes of continuous inactivity before dashboard auto-logout", valueType: "number", scope: "global", isSensitive: false, isPublic: false, requiresApproval: false, defaultValue: 20 },

  // Procurement
  { key: "procurement.payment_required", category: "procurement", label: "Payment Required Before Procurement", description: "Enforce full order payment before generating supplier procurement demand", valueType: "boolean", scope: "global", isSensitive: true, isPublic: false, requiresApproval: true, defaultValue: true },

  // Feature Flags
  { key: "flags.supplier_comparison", category: "flags", label: "Supplier Comparison View", description: "Enable multi-supplier price comparison matrix in procurement", valueType: "boolean", scope: "global", isSensitive: false, isPublic: false, requiresApproval: false, defaultValue: true },
  { key: "flags.happypay_bnpl", category: "flags", label: "Happy Pay BNPL Checkout", description: "Enable Happy Pay Buy-Now-Pay-Later payment option for parents", valueType: "boolean", scope: "global", isSensitive: false, isPublic: true, requiresApproval: true, defaultValue: true },
];

export interface SystemSettingRecord {
  key: string;
  category: SystemSettingCategory;
  value: unknown;
  value_type: SettingValueType;
  scope: SettingScope;
  description: string;
  is_sensitive: boolean;
  is_public: boolean;
  requires_approval: boolean;
  updated_by?: string | null;
  updated_at?: string | null;
  version: number;
}

export interface SystemSettingsAuditRecord {
  id: string;
  setting_key: string;
  old_value: unknown;
  new_value: unknown;
  change_reason?: string | null;
  actor_id?: string | null;
  actor_email?: string | null;
  created_at: string;
}

export interface IntegrationStatus {
  name: string;
  purpose: string;
  status: "connected" | "action_required" | "error" | "not_configured";
  environment: "Production" | "Staging" | "Development";
  details: string;
  lastCheckedAt: string;
}

export interface SystemPerformanceMetrics {
  health: "Healthy" | "Degraded" | "Critical";
  apiLatencyMs: number;
  dashboardLoadMs: number;
  activeRealtimeConnections: number;
  recentErrorsCount: number;
  databaseRowsCount: {
    schools: number;
    packs: number;
    items: number;
    orders: number;
    auditLogs: number;
  };
  recommendations: { issue: string; suggestion: string }[];
}
