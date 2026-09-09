export const MOMO_PROVIDERS = [
  { value: "MTN", label: "MTN Mobile Money" },
  { value: "TELECEL", label: "Telecel / Vodafone Cash" },
  { value: "AIRTELTIGO", label: "AirtelTigo Money" },
] as const;

export const GHANA_PHONE_REGEX = /^(?:0|\+233)[235]\d{8}$/;
export const GHANA_PHONE_ERROR =
  "Please enter a valid Ghana mobile number (e.g., 0241234567 or +233241234567)";

export function getNetworkLabel(network: string): string {
  return MOMO_PROVIDERS.find((p) => p.value === network)?.label ?? network;
}

export function maskLast4(last4: string): string {
  return `••••••${last4}`;
}

export function extractLast4(phone: string): string {
  return phone.trim().slice(-4);
}
