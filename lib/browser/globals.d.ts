import type { PexpacksBrowserData } from "./criticalData";

declare global {
  interface Window {
    __PEXPACKS_DATA__?: PexpacksBrowserData;
  }
}

export {};
