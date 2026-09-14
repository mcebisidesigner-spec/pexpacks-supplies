import { describe, expect, it, vi } from "vitest";
import {
  deleteCached,
  getCachedJson,
  getOrSetCached,
  getRedisCloudClient,
  setCachedJson,
} from "@/lib/cache/redisCloud";

describe("Redis Cloud Cache Client", () => {
  it("exports all expected caching interfaces", () => {
    expect(typeof getRedisCloudClient).toBe("function");
    expect(typeof getCachedJson).toBe("function");
    expect(typeof setCachedJson).toBe("function");
    expect(typeof deleteCached).toBe("function");
    expect(typeof getOrSetCached).toBe("function");
  });

  it("handles missing environment configuration gracefully without throwing", async () => {
    const originalUrl = process.env.REDIS_URL;
    const originalPexUrl = process.env.pexpacks_REDIS_URL;

    delete process.env.REDIS_URL;
    delete process.env.pexpacks_REDIS_URL;
    // reset cached client in global
    delete (globalThis as any).__pexpacksRedisCloud;

    expect(getRedisCloudClient()).toBeNull();
    expect(await getCachedJson("non-existent-key")).toBeNull();
    expect(await setCachedJson("test-key", { hello: "world" })).toBe(false);
    expect(await deleteCached("test-key")).toBe(false);

    // getOrSetCached should execute fetcher and return fresh data
    const fetcher = vi.fn().mockResolvedValue({ id: "school-123", name: "High School" });
    const result = await getOrSetCached("test-school", fetcher);

    expect(result).toEqual({ id: "school-123", name: "High School" });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // restore
    if (originalUrl) process.env.REDIS_URL = originalUrl;
    if (originalPexUrl) process.env.pexpacks_REDIS_URL = originalPexUrl;
    delete (globalThis as any).__pexpacksRedisCloud;
  });

  it("safely reads and writes cache when Redis URL is configured", async () => {
    process.env.REDIS_URL = "redis://default:xerXWWBCZYPxiRnWNzooIUBJ1tvh7KPz@amberish-rabbits-freehand-95911.db.redis.io:17081";
    delete (globalThis as any).__pexpacksRedisCloud;

    const testKey = "test:school:test-high-school";
    const testData = { name: "Test High School", grades: ["Grade 1", "Grade 2"] };

    const written = await setCachedJson(testKey, testData, 60);
    expect(written).toBe(true);

    const retrieved = await getCachedJson<typeof testData>(testKey);
    expect(retrieved).toEqual(testData);

    const deleted = await deleteCached(testKey);
    expect(deleted).toBe(true);

    const afterDelete = await getCachedJson(testKey);
    expect(afterDelete).toBeNull();

    const client = getRedisCloudClient();
    if (client) client.disconnect();
  });
});
