import { describe, it, expect, vi } from "vitest";
import {
  computeSha1Hex,
  checkLeakedPassword,
  validateAdminPassword,
  validateAdminPasswordWithBreachCheck,
  MIN_ADMIN_PASSWORD_LENGTH,
} from "@/lib/security/password-policy";

describe("HaveIBeenPwned k-Anonymity Leak Protection", () => {
  it("correctly computes uppercase SHA-1 hexadecimal hash", async () => {
    // Standard test vector: "password" -> 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    const hash = await computeSha1Hex("password");
    expect(hash).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
    expect(hash.length).toBe(40);
  });

  it("sends only the first 5 characters (k-Anonymity prefix) to the API", async () => {
    let requestedUrl = "";
    const mockFetch = vi.fn(async (url: string | URL | Request) => {
      requestedUrl = url.toString();
      return new Response("0018A45C4D1DEF81644B54AB7F969B88D65:4\r\n", {
        status: 200,
      });
    }) as unknown as typeof fetch;

    await checkLeakedPassword("SuperSecretPexPass2026!", {
      fetchImpl: mockFetch,
    });

    const expectedHash = await computeSha1Hex("SuperSecretPexPass2026!");
    const expectedPrefix = expectedHash.slice(0, 5);

    expect(requestedUrl).toBe(
      `https://api.pwnedpasswords.com/range/${expectedPrefix}`,
    );
    expect(requestedUrl).not.toContain("SuperSecretPexPass2026!");
    expect(requestedUrl).not.toContain(expectedHash);
  });

  it("detects breached passwords when hash suffix matches in response", async () => {
    const password = "P@ssword123456789";
    const fullHash = await computeSha1Hex(password);
    const suffix = fullHash.slice(5);

    const mockResponseText = `00112233445566778899AABBCCDDEEFF001:10\r\n${suffix}:428\r\nFFAABBCCDDEEFF00112233445566778899A:3\r\n`;

    const mockFetch = vi.fn(async () => {
      return new Response(mockResponseText, { status: 200 });
    }) as unknown as typeof fetch;

    const result = await checkLeakedPassword(password, {
      fetchImpl: mockFetch,
    });

    expect(result.isPwned).toBe(true);
    expect(result.breachCount).toBe(428);
  });

  it("recognizes safe passwords when suffix is absent from response", async () => {
    const mockResponseText = `00112233445566778899AABBCCDDEEFF001:10\r\nFFAABBCCDDEEFF00112233445566778899A:3\r\n`;

    const mockFetch = vi.fn(async () => {
      return new Response(mockResponseText, { status: 200 });
    }) as unknown as typeof fetch;

    const result = await checkLeakedPassword("TrulyUniqueUncompromisedPass2026!", {
      fetchImpl: mockFetch,
    });

    expect(result.isPwned).toBe(false);
    expect(result.breachCount).toBe(0);
  });

  it("fails open gracefully if HIBP API returns an error or times out", async () => {
    const mockFetch = vi.fn(async () => {
      return new Response("Service Unavailable", { status: 503 });
    }) as unknown as typeof fetch;

    const result = await checkLeakedPassword("AnyValidPassword123!", {
      fetchImpl: mockFetch,
    });

    expect(result.isPwned).toBe(false);
    expect(result.error).toContain("503");
  });

  it("validates password length and match synchronously", () => {
    expect(validateAdminPassword("short", "short").ok).toBe(false);
    expect(
      validateAdminPassword(
        "A".repeat(MIN_ADMIN_PASSWORD_LENGTH - 1),
        "A".repeat(MIN_ADMIN_PASSWORD_LENGTH - 1),
      ).ok,
    ).toBe(false);
    expect(
      validateAdminPassword("ValidPassword123", "DifferentPassword123").ok,
    ).toBe(false);
    expect(
      validateAdminPassword("ValidPassword123!", "ValidPassword123!").ok,
    ).toBe(true);
  });

  it("blocks compromised passwords via validateAdminPasswordWithBreachCheck", async () => {
    const pwnedPassword = "P@ssword123456";
    const fullHash = await computeSha1Hex(pwnedPassword);
    const suffix = fullHash.slice(5);

    const mockFetch = vi.fn(async () => {
      return new Response(`${suffix}:1250\r\n`, { status: 200 });
    }) as unknown as typeof fetch;

    const res = await validateAdminPasswordWithBreachCheck(
      pwnedPassword,
      pwnedPassword,
      { fetchImpl: mockFetch },
    );

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.message).toContain("known data breaches");
      expect(res.breachCount).toBe(1250);
    }
  });

  it("allows uncompromised passwords via validateAdminPasswordWithBreachCheck", async () => {
    const mockFetch = vi.fn(async () => {
      return new Response("00112233445566778899AABBCCDDEEFF001:10\r\n", {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const res = await validateAdminPasswordWithBreachCheck(
      "Uncompromised#Secure#2026!",
      "Uncompromised#Secure#2026!",
      { fetchImpl: mockFetch },
    );

    expect(res.ok).toBe(true);
  });
});
