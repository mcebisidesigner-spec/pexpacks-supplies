/**
 * Vercel Edge Config & Operational Feature Toggle Helper
 * 
 * Provides sub-15ms reading for instant global switches (e.g., Pre-Orders Open/Closed,
 * Campaign Announcement Banners) without requiring full application redeployments.
 */

export interface FeatureFlags {
  isPreOrdersOpen: boolean;
  campaignBannerText?: string;
  maintenanceMode: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  isPreOrdersOpen: true,
  campaignBannerText: undefined,
  maintenanceMode: false,
};

/**
 * Reads a feature toggle key from Vercel Edge Config or environment variables with graceful fallback.
 */
export async function getFeatureFlag<K extends keyof FeatureFlags>(
  key: K,
  defaultValue?: FeatureFlags[K]
): Promise<FeatureFlags[K]> {
  const fallback = defaultValue ?? DEFAULT_FLAGS[key];

  const edgeConfigUrl = process.env.EDGE_CONFIG;
  if (!edgeConfigUrl) {
    return fallback;
  }

  try {
    const res = await fetch(`${edgeConfigUrl}/item/${key}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return (data as FeatureFlags[K]) ?? fallback;
  } catch (error) {
    console.warn(`[EdgeConfig] Failed to fetch flag "${key}", using fallback:`, error);
    return fallback;
  }
}
