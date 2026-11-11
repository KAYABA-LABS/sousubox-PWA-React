/**
 * Feature switches read at build time.
 * Savings plans and Invest were launched behind a "coming soon" gate; set
 * NEXT_PUBLIC_ENABLE_INVEST=true to show the full Plans and Invest screens.
 */
export const INVEST_ENABLED = process.env.NEXT_PUBLIC_ENABLE_INVEST === "true";
