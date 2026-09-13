export const MIN_ADMIN_PASSWORD_LENGTH = 12;

/**
 * Computes uppercase SHA-1 hexadecimal hash using Web Crypto API.
 * Compatible with Edge runtimes, modern Node.js, and browser environments.
 */
export async function computeSha1Hex(value: string): Promise<string> {
  const buffer = new TextEncoder().encode(value);
  const digestBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export interface PwnedPasswordCheckResult {
  isPwned: boolean;
  breachCount: number;
  error?: string;
}

/**
 * Checks a password against HaveIBeenPwned's k-Anonymity API (Pwned Passwords).
 *
 * Privacy & Security Architecture:
 * - Only the first 5 characters of the SHA-1 hash (the prefix) are sent to the HIBP service.
 * - The actual password and remainder of the hash NEVER leave the local environment.
 * - The API responds with the range of hash suffixes sharing that prefix.
 * - Local suffix matching verifies if the candidate password appeared in public breach dumps.
 */
export async function checkLeakedPassword(
  password: string,
  options?: { timeoutMs?: number; fetchImpl?: typeof fetch },
): Promise<PwnedPasswordCheckResult> {
  if (!password) {
    return { isPwned: false, breachCount: 0 };
  }

  try {
    const hash = await computeSha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options?.timeoutMs ?? 4000,
    );
    const fetcher = options?.fetchImpl ?? fetch;

    const response = await fetcher(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        method: "GET",
        headers: {
          "Add-Padding": "true",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    if (!response.ok) {
      // Graceful fallback: do not lock legitimate users out if external API is unreachable
      return {
        isPwned: false,
        breachCount: 0,
        error: `HIBP API returned status ${response.status}`,
      };
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        const count = parseInt(countStr?.trim() || "0", 10);
        return { isPwned: count > 0, breachCount: count };
      }
    }

    return { isPwned: false, breachCount: 0 };
  } catch (err: unknown) {
    // Network or timeout failure - fails open with logged error for operational resilience
    const msg = err instanceof Error ? err.message : String(err);
    return { isPwned: false, breachCount: 0, error: msg };
  }
}

/**
 * Synchronous client/form validation for basic format and confirmation matching.
 */
export function validateAdminPassword(
  password: string,
  confirmPassword: string,
): { ok: true } | { ok: false; message: string } {
  if (!password || password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  if (password !== confirmPassword) {
    return {
      ok: false,
      message: "Passwords do not match. Please verify and try again.",
    };
  }

  return { ok: true };
}

/**
 * Asynchronous validation that enforces length, match, and checks the password
 * against the HaveIBeenPwned breach database via k-Anonymity.
 */
export async function validateAdminPasswordWithBreachCheck(
  password: string,
  confirmPassword: string,
  options?: { timeoutMs?: number; fetchImpl?: typeof fetch },
): Promise<{ ok: true } | { ok: false; message: string; breachCount?: number }> {
  const syncValidation = validateAdminPassword(password, confirmPassword);
  if (!syncValidation.ok) {
    return syncValidation;
  }

  const pwnedResult = await checkLeakedPassword(password, options);
  if (pwnedResult.isPwned) {
    const timesDesc =
      pwnedResult.breachCount > 1
        ? `${pwnedResult.breachCount.toLocaleString()} known data breaches`
        : "a known data breach";
    return {
      ok: false,
      message: `This password was found in ${timesDesc}. For your security, please choose a unique password that has not been compromised.`,
      breachCount: pwnedResult.breachCount,
    };
  }

  return { ok: true };
}

