import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzePostgresConnection } from "@/lib/supabase/connection-pooler";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Supabase Connection Pooling & Serverless Database Architecture", () => {
  it("enforces Transaction Pooler (port 6543) for serverless-safe Postgres connections", () => {
    const pooledUrl =
      "postgres://postgres.myproject:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    const analysis = analyzePostgresConnection(pooledUrl);

    expect(analysis.isSupabase).toBe(true);
    expect(analysis.isPoolerHost).toBe(true);
    expect(analysis.port).toBe(6543);
    expect(analysis.mode).toBe("transaction");
    expect(analysis.isServerlessSafe).toBe(true);
    expect(analysis.warnings).toHaveLength(0);
  });

  it("identifies direct Postgres connections (port 5432) as unsafe for serverless runtime", () => {
    const directUrl =
      "postgres://postgres.myproject:secret@db.myproject.supabase.co:5432/postgres";
    const analysis = analyzePostgresConnection(directUrl);

    expect(analysis.isSupabase).toBe(true);
    expect(analysis.isPoolerHost).toBe(false);
    expect(analysis.port).toBe(5432);
    expect(analysis.mode).toBe("direct");
    expect(analysis.isServerlessSafe).toBe(false);
    expect(analysis.warnings.length).toBeGreaterThan(0);
    expect(analysis.warnings[0]).toContain("overload Postgres in serverless");
  });

  it("warns if pooler is configured with session mode instead of transaction mode", () => {
    const sessionPoolerUrl =
      "postgres://postgres.myproject:secret@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pool_mode=session";
    const analysis = analyzePostgresConnection(sessionPoolerUrl);

    expect(analysis.mode).toBe("session");
    expect(analysis.isServerlessSafe).toBe(false);
    expect(analysis.warnings[0]).toContain("transaction mode is strongly recommended");
  });

  it("verifies application runtime uses Supabase Client API over HTTP instead of raw TCP drivers", () => {
    const adminTs = readRepoFile("lib/supabase/admin.ts");
    expect(adminTs).toContain('import { createClient } from "@supabase/supabase-js"');
    expect(adminTs).not.toContain('import { Pool } from "pg"');
    expect(adminTs).not.toContain('import { Client } from "pg"');

    const serverTs = readRepoFile("lib/supabase/server.ts");
    expect(serverTs).toContain('import { createServerClient } from "@supabase/ssr"');
    expect(serverTs).toContain("Supavisor Transaction Pooler");
  });

  it("ensures local Supabase CLI config has connection pooler enabled in transaction mode", () => {
    const configToml = readRepoFile("supabase/config.toml");
    expect(configToml).toContain("[db.pooler]");
    expect(configToml).toContain("enabled = true");
    expect(configToml).toContain('pool_mode = "transaction"');
  });

  it("verifies .env.example separates Transaction Pooler (DATABASE_URL) from Direct Migration URL (DIRECT_URL)", () => {
    const envExample = readRepoFile(".env.example");
    expect(envExample).toContain("DATABASE_URL=postgres://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true");
    expect(envExample).toContain("DIRECT_URL=postgres://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres");
  });
});
