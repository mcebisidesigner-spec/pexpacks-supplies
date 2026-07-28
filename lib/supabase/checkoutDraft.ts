const DEVICE_ID_KEY = "pex-device-id";

function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "offline";
  }
}

export async function saveCheckoutDraft(state: unknown): Promise<void> {
  const deviceId = getDeviceId();
  try {
    await fetch("/api/forms/checkout-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, state }),
    });
  } catch {
    /* silently fail — non-critical */
  }
}

export async function loadCheckoutDraft(): Promise<unknown | null> {
  const deviceId = getDeviceId();
  try {
    const res = await fetch(`/api/forms/checkout-draft?device_id=${encodeURIComponent(deviceId)}`);
    const json = await res.json();
    return json.success ? json.state ?? null : null;
  } catch {
    return null;
  }
}

export async function clearCheckoutDraft(): Promise<void> {
  const deviceId = getDeviceId();
  try {
    await fetch(`/api/forms/checkout-draft?device_id=${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
    });
  } catch {
    /* silently fail */
  }
}
