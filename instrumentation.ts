export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const started = Date.now();
  try {
    const { getSearchIndex } = await import("@/lib/schools/schoolSearchData");
    await getSearchIndex();
    console.info(
      `[performance] search index warmed at startup in ${Date.now() - started}ms`
    );
  } catch (err) {
    console.warn(
      "[performance] search index warm-up failed; first request will build it:",
      err
    );
  }
}
