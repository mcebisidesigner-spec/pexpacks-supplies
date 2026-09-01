/**
 * Supabase Connection Pooling & Serverless Database Architecture Helper
 *
 * In serverless environments like Vercel, long-lived TCP database connections
 * cause connection exhaustion and high latency.
 *
 * 1. Primary Strategy: Use the Supabase Client API (@supabase/supabase-js, @supabase/ssr).
 *    Queries run over stateless HTTPS (PostgREST), avoiding persistent client-side TCP sockets.
 *
 * 2. Secondary Strategy (Direct Postgres): When direct SQL or ORM connections are needed,
 *    always connect through the Supabase Connection Pooler (Supavisor) in TRANSACTION MODE
 *    (Port 6543, host aws-0-[region].pooler.supabase.com, with ?pgbouncer=true).
 *
 * 3. Migration / DDL Strategy: Direct connection (Port 5432) should only be used for
 *    offline migration scripts and CLI pushes (DIRECT_URL), never in serverless functions.
 */

export interface ConnectionAnalysis {
  isSupabase: boolean;
  isPoolerHost: boolean;
  port: number | null;
  mode: "transaction" | "session" | "direct" | "unknown";
  isServerlessSafe: boolean;
  warnings: string[];
  recommendation: string;
}

/**
 * Validates whether a given PostgreSQL connection string is safe for Vercel serverless execution.
 */
export function analyzePostgresConnection(connectionString?: string | null): ConnectionAnalysis {
  if (!connectionString || typeof connectionString !== "string") {
    return {
      isSupabase: false,
      isPoolerHost: false,
      port: null,
      mode: "unknown",
      isServerlessSafe: false,
      warnings: ["No connection string provided."],
      recommendation: "Use the Supabase HTTP Client API for serverless database operations.",
    };
  }

  const warnings: string[] = [];

  try {
    // Normalise protocol for standard URL parser
    const normalised = connectionString.startsWith("postgres://")
      ? connectionString.replace("postgres://", "http://")
      : connectionString.startsWith("postgresql://")
        ? connectionString.replace("postgresql://", "http://")
        : `http://${connectionString}`;

    const parsed = new URL(normalised);
    const host = parsed.hostname.toLowerCase();
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    const isPoolerHost = host.includes("pooler.supabase.com");
    const isSupabaseDirectHost = host.includes(".supabase.co");
    const isSupabase = isPoolerHost || isSupabaseDirectHost;
    const pgbouncerFlag = parsed.searchParams.get("pgbouncer") === "true";
    const poolModeParam = parsed.searchParams.get("pool_mode")?.toLowerCase();

    let mode: "transaction" | "session" | "direct" | "unknown" = "unknown";
    let isServerlessSafe = false;

    if (isPoolerHost || port === 6543) {
      if (poolModeParam === "session") {
        mode = "session";
        warnings.push(
          "Connection pooler is configured in session mode. In serverless environments, transaction mode is strongly recommended.",
        );
        isServerlessSafe = false;
      } else {
        mode = "transaction";
        isServerlessSafe = true;
      }
    } else if (port === 5432 && isSupabaseDirectHost) {
      mode = "direct";
      warnings.push(
        "Connecting directly to Supabase Postgres (Port 5432) creates long-lived database connections that can overload Postgres in serverless environments.",
      );
      isServerlessSafe = false;
    } else if (port === 54321 || port === 54329) {
      // Local Supabase CLI
      mode = port === 54329 ? "transaction" : "direct";
      isServerlessSafe = true;
    } else {
      mode = pgbouncerFlag || poolModeParam === "transaction" ? "transaction" : "unknown";
      isServerlessSafe = mode === "transaction";
    }

    let recommendation: string;
    if (isServerlessSafe) {
      recommendation =
        "Connection string uses Supabase Connection Pooler in transaction mode. Safe for serverless runtime.";
    } else if (isSupabaseDirectHost && port === 5432) {
      recommendation =
        "Switch to the Supabase Connection Pooler on port 6543 with ?pgbouncer=true or use the Supabase HTTP Client API.";
    } else {
      recommendation =
        "Use the Supabase Client API for serverless routes to avoid persistent database connection overload.";
    }

    return {
      isSupabase,
      isPoolerHost,
      port,
      mode,
      isServerlessSafe,
      warnings,
      recommendation,
    };
  } catch (err) {
    return {
      isSupabase: false,
      isPoolerHost: false,
      port: null,
      mode: "unknown",
      isServerlessSafe: false,
      warnings: [`Failed to parse connection string: ${err instanceof Error ? err.message : String(err)}`],
      recommendation: "Ensure connection string is a valid PostgreSQL URI.",
    };
  }
}

/**
 * Returns the recommended DATABASE_URL for serverless execution.
 * Returns the pooler URL if configured, or undefined if relying strictly on the Supabase Client API.
 */
export function getServerlessDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const analysis = analyzePostgresConnection(url);
  if (!analysis.isServerlessSafe && process.env.NODE_ENV === "production") {
    console.warn(
      "[db-pooler] Warning: DATABASE_URL is not using Supabase Connection Pooler in transaction mode.",
      analysis.warnings.join(" "),
    );
  }

  return url;
}

/**
 * Returns the direct migration database URL (Port 5432) for CLI scripts.
 */
export function getDirectMigrationDatabaseUrl(): string | undefined {
  return process.env.DIRECT_URL || process.env.DATABASE_URL;
}
