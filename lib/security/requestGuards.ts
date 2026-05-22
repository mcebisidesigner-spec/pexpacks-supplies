import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.env.TMPDIR || process.env.TMP || "/tmp", ".Pexpacks-rate-limit");
const PERSIST_INTERVAL = 30_000;
const CLEANUP_INTERVAL = 60_000;

type RateLimitConfig = {
  keyPrefix: string;
  windowMs: number;
  max: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type PersistedStore = Record<string, RateLimitBucket>;

const memoryStore = new Map<string, RateLimitBucket>();
let persistTimer: ReturnType<typeof setInterval> | null = null;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
let storeLoaded = false;

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // Directory already exists or cannot be created
  }
}

function cacheFilePath(): string {
  return path.join(CACHE_DIR, "rate-limit-store.json");
}

async function loadFromDisk(): Promise<void> {
  if (storeLoaded) return;
  storeLoaded = true;

  try {
    const data = await fs.readFile(cacheFilePath(), "utf-8");
    const parsed = JSON.parse(data) as PersistedStore;
    const now = Date.now();

    for (const [key, bucket] of Object.entries(parsed)) {
      if (bucket.resetAt > now) {
        memoryStore.set(key, bucket);
      }
    }
  } catch {
    // File doesn't exist or is corrupted — start fresh
  }
}

async function persistToDisk(): Promise<void> {
  try {
    await ensureCacheDir();
    const now = Date.now();
    const store: PersistedStore = {};

    for (const [key, bucket] of memoryStore.entries()) {
      if (bucket.resetAt > now) {
        store[key] = bucket;
      }
    }

    await fs.writeFile(cacheFilePath(), JSON.stringify(store), "utf-8");
  } catch {
    // File write failed — non-critical, in-memory still works
  }
}

function startBackgroundTasks() {
  if (typeof process === "undefined") return;
  if (persistTimer) return;

  loadFromDisk();

  persistTimer = setInterval(persistToDisk, PERSIST_INTERVAL);
  persistTimer.unref();

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      if (bucket.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  cleanupTimer.unref();
}

function getClientAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfIp?.trim() ||
    "unknown"
  );
}

function getAllowedOrigins(request: NextRequest) {
  const allowed = new Set<string>([request.nextUrl.origin]);
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

  for (const value of [configuredSiteUrl, vercelUrl]) {
    if (!value) continue;

    try {
      allowed.add(new URL(value).origin);
    } catch {
      // Ignore malformed environment values
    }
  }

  return allowed;
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request).has(origin);
}

export function rateLimitRequest(
  request: NextRequest,
  { keyPrefix, windowMs, max }: RateLimitConfig
) {
  startBackgroundTasks();

  const now = Date.now();
  const key = `${keyPrefix}:${getClientAddress(request)}`;
  const current = memoryStore.get(key);

  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  memoryStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, max - current.count),
    retryAfter: 0,
  };
}



