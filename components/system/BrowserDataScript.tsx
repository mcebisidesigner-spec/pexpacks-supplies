import {
  getPexpacksBrowserData,
  serializeBrowserData,
} from "@/lib/browser/criticalData";

export function BrowserDataScript() {
  const payload = serializeBrowserData(getPexpacksBrowserData());

  return (
    <script
      id="pexpacks-browser-data"
      dangerouslySetInnerHTML={{
        __html: `window.__PEXPACKS_DATA__=${payload};`,
      }}
    />
  );
}
