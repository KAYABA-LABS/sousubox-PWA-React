type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/**
 * Analytics hook point. No provider is chosen yet (plan §12.1), so this only
 * logs in development. Never pass PII here — ids and codes only.
 */
export function track(event: string, props: AnalyticsProps = {}) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, props);
  }
}
