import type { ModeratorApplication, ModeratorDocumentField, RequiredModeratorDocument } from "@/lib/api";

/** Server rules for each moderator application document (backend brief §1). */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MOTIVATION_MAX_LENGTH = 1000;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export const ACCEPTED_MIME_TYPES = [...new Set(Object.values(MIME_BY_EXTENSION))];

/** The file input's `accept`: MIME types plus extensions, for pickers that report no type. */
export const DOCUMENT_ACCEPT = [...ACCEPTED_MIME_TYPES, ...Object.keys(MIME_BY_EXTENSION).map((ext) => `.${ext}`)].join(",");

/** Used when an older backend doesn't send `requiredDocuments`. */
export const DEFAULT_REQUIRED_DOCUMENTS: RequiredModeratorDocument[] = [
  { kind: "BUSINESS_REGISTRATION", field: "businessRegistration", label: "Certificate of incorporation" },
  { kind: "PROOF_OF_ADDRESS", field: "proofOfAddress", label: "Proof of address" },
  { kind: "REFERENCE_LETTER", field: "referenceLetter", label: "Reference letter" },
];

export function requiredDocumentsOrDefault(docs: RequiredModeratorDocument[] | undefined | null) {
  return docs && docs.length > 0 ? docs : DEFAULT_REQUIRED_DOCUMENTS;
}

export function inferMimeType(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[ext] ?? null;
}

/** The accepted MIME type for a file, falling back to its extension; null when unsupported. */
export function documentMimeType(file: Pick<File, "name" | "type">): string | null {
  const type = file.type.toLowerCase();
  if (ACCEPTED_MIME_TYPES.includes(type)) return type;
  // Some Android pickers report "" or application/octet-stream for HEIC and PDFs.
  if (!type || type === "application/octet-stream") return inferMimeType(file.name);
  return null;
}

export type DocumentProblem = "type" | "empty" | "size";

export function validateDocument(file: Pick<File, "name" | "type" | "size">): DocumentProblem | null {
  if (!documentMimeType(file)) return "type";
  if (file.size === 0) return "empty";
  if (file.size > MAX_DOCUMENT_BYTES) return "size";
  return null;
}

/** Re-wraps a file whose reported type is missing so the server's MIME check sees the right one. */
export function withMimeType(file: File): File {
  const type = documentMimeType(file);
  if (!type || file.type === type) return file;
  return new File([file], file.name, { type, lastModified: file.lastModified });
}

export function buildModeratorApplicationForm(app: ModeratorApplication): FormData {
  const form = new FormData();
  const motivation = app.motivation?.trim().slice(0, MOTIVATION_MAX_LENGTH);
  if (motivation) form.append("motivation", motivation);
  for (const [field, file] of Object.entries(app.files) as [ModeratorDocumentField, File][]) {
    form.append(field, withMimeType(file), file.name);
  }
  return form;
}

/**
 * Splits `INVALID_DOCUMENTS.details[]` ("proofOfAddress: must be 10 MB or smaller")
 * into per-field messages; lines for unknown fields go to `general`.
 */
export function mapDocumentErrors(details: string[] | undefined, fields: readonly string[]) {
  const byField: Partial<Record<ModeratorDocumentField, string>> = {};
  const general: string[] = [];
  for (const line of details ?? []) {
    const sep = line.indexOf(":");
    const field = sep > 0 ? line.slice(0, sep).trim() : "";
    if (fields.includes(field)) {
      const message = line.slice(sep + 1).trim();
      const key = field as ModeratorDocumentField;
      byField[key] = byField[key] ? `${byField[key]} ${message}` : message;
    } else {
      general.push(line);
    }
  }
  return { byField, general };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Coarse size for analytics, so exact sizes aren't tracked. */
export function sizeBucket(bytes: number): string {
  if (bytes < 1024 * 1024) return "<1MB";
  if (bytes < 3 * 1024 * 1024) return "1-3MB";
  if (bytes < 6 * 1024 * 1024) return "3-6MB";
  return "6-10MB";
}
