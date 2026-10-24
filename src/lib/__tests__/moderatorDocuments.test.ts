import { describe, expect, it } from "vitest";
import {
  buildModeratorApplicationForm,
  DEFAULT_REQUIRED_DOCUMENTS,
  documentMimeType,
  mapDocumentErrors,
  MAX_DOCUMENT_BYTES,
  requiredDocumentsOrDefault,
  validateDocument,
  withMimeType,
} from "@/lib/moderatorDocuments";

const fileLike = (name: string, type: string, size = 100) => ({ name, type, size });
const FIELDS = DEFAULT_REQUIRED_DOCUMENTS.map((d) => d.field);

describe("validateDocument", () => {
  it("accepts the six server MIME types", () => {
    for (const type of ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]) {
      expect(validateDocument(fileLike("doc", type))).toBeNull();
    }
  });

  it("rejects other types", () => {
    expect(validateDocument(fileLike("doc.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))).toBe("type");
    expect(validateDocument(fileLike("pic.gif", "image/gif"))).toBe("type");
  });

  it("falls back to the extension when the picker reports no type", () => {
    expect(validateDocument(fileLike("IMG_0001.HEIC", ""))).toBeNull();
    expect(validateDocument(fileLike("bill.pdf", "application/octet-stream"))).toBeNull();
    expect(validateDocument(fileLike("notes.txt", ""))).toBe("type");
  });

  it("rejects empty files and files over 10 MB", () => {
    expect(validateDocument(fileLike("a.pdf", "application/pdf", 0))).toBe("empty");
    expect(validateDocument(fileLike("a.pdf", "application/pdf", MAX_DOCUMENT_BYTES))).toBeNull();
    expect(validateDocument(fileLike("a.pdf", "application/pdf", MAX_DOCUMENT_BYTES + 1))).toBe("size");
  });
});

describe("withMimeType", () => {
  it("re-wraps files with a missing type so the server sees the right MIME", () => {
    const original = new File(["x"], "scan.heic", { type: "" });
    const fixed = withMimeType(original);
    expect(fixed.type).toBe("image/heic");
    expect(fixed.name).toBe("scan.heic");
    expect(documentMimeType(fixed)).toBe("image/heic");
  });

  it("leaves correctly typed files alone", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    expect(withMimeType(file)).toBe(file);
  });
});

describe("buildModeratorApplicationForm", () => {
  const files = {
    businessRegistration: new File(["a"], "cert.pdf", { type: "application/pdf" }),
    proofOfAddress: new File(["b"], "bill.jpg", { type: "image/jpeg" }),
    referenceLetter: new File(["c"], "letter.heic", { type: "" }),
  };

  it("sends exactly the three files and the trimmed motivation", () => {
    const form = buildModeratorApplicationForm({ motivation: "  I run a susu group.  ", files });
    expect([...form.keys()].sort()).toEqual(["businessRegistration", "motivation", "proofOfAddress", "referenceLetter"]);
    expect(form.get("motivation")).toBe("I run a susu group.");
    expect((form.get("proofOfAddress") as File).name).toBe("bill.jpg");
    expect((form.get("referenceLetter") as File).type).toBe("image/heic");
  });

  it("omits a blank motivation and caps a long one at 1000 characters", () => {
    expect(buildModeratorApplicationForm({ motivation: "   ", files }).has("motivation")).toBe(false);
    expect((buildModeratorApplicationForm({ motivation: "x".repeat(1200), files }).get("motivation") as string).length).toBe(1000);
  });
});

describe("mapDocumentErrors", () => {
  it("routes prefixed lines to their slot and keeps the rest general", () => {
    const { byField, general } = mapDocumentErrors(
      ["proofOfAddress: must be 10 MB or smaller", "Unexpected field: photo", "referenceLetter: is required"],
      FIELDS
    );
    expect(byField).toEqual({ proofOfAddress: "must be 10 MB or smaller", referenceLetter: "is required" });
    expect(general).toEqual(["Unexpected field: photo"]);
  });

  it("keeps colons inside the message and joins multiple problems", () => {
    const { byField } = mapDocumentErrors(
      ["businessRegistration: type not allowed: text/plain", "businessRegistration: must not be empty"],
      FIELDS
    );
    expect(byField.businessRegistration).toBe("type not allowed: text/plain must not be empty");
  });

  it("handles missing details", () => {
    expect(mapDocumentErrors(undefined, FIELDS)).toEqual({ byField: {}, general: [] });
  });
});

describe("requiredDocumentsOrDefault", () => {
  it("falls back when the backend sends none", () => {
    expect(requiredDocumentsOrDefault(undefined)).toBe(DEFAULT_REQUIRED_DOCUMENTS);
    expect(requiredDocumentsOrDefault([])).toBe(DEFAULT_REQUIRED_DOCUMENTS);
    const custom = [{ kind: "PROOF_OF_ADDRESS" as const, field: "proofOfAddress" as const, label: "Utility bill" }];
    expect(requiredDocumentsOrDefault(custom)).toBe(custom);
  });
});
