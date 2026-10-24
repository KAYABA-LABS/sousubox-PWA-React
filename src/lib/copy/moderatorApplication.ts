import type { ModeratorDocumentKind } from "@/lib/api";
import type { DocumentProblem } from "@/lib/moderatorDocuments";

/** User-facing strings for the moderator application (moderator application plan §7). */
export const moderatorApplicationCopy = {
  intro: "Upload three documents so we can confirm who you are and where you live. PDF or photo, up to 10 MB each.",
  documentsTitle: "Your documents",

  documents: {
    BUSINESS_REGISTRATION: {
      help: "Your business's certificate of incorporation from the Office of the Registrar of Companies. Make sure the whole certificate is visible and readable.",
      examples: null,
      multiPage: false,
    },
    PROOF_OF_ADDRESS: {
      help: "A utility bill issued in the last 3 months, showing your name and house address.",
      examples: "e.g. ECG electricity bill, Ghana Water bill",
      multiPage: true,
    },
    REFERENCE_LETTER: {
      help: "A signed letter from a civil servant who knows you, such as a teacher, nurse, police officer or district assembly officer. If possible it should be on official letterhead and include their name, position, staff ID and phone number, and be signed and dated.",
      examples: null,
      multiPage: true,
    },
  } satisfies Record<ModeratorDocumentKind, { help: string; examples: string | null; multiPage: boolean }>,

  slot: {
    upload: "Upload file",
    hint: "PDF, JPG, PNG, WebP or HEIC · max 10 MB",
    multiPage: "More than one page? Upload it as a single PDF.",
    replace: "Replace",
    remove: "Remove",
    missing: "Add this document to continue.",
  },

  problems: {
    type: "This file type isn't supported. Use a PDF, JPG, PNG, WebP or HEIC file.",
    empty: "This file is empty. Pick another one.",
    size: "This file is over 10 MB. Try a smaller scan or save it as a PDF.",
  } satisfies Record<DocumentProblem, string>,

  motivationLabel: "Why do you want to moderate?",
  motivationPlaceholder: "Tell us about the group you'd run a pool for.",

  privacy:
    "Only SousuBoxx admins reviewing your application can see these documents. They're stored privately and never shown to pool members.",
  privacyDraft: "Until you send them, the files you pick are saved on this device only.",

  draftRestored: "We kept the files you picked earlier.",
  draftClear: "Clear",

  submit: "Send application",
  sending: (percent: number) => `Sending… ${percent}%`,
  finishing: "Finishing up…",
  offline: "You're offline. Your files are saved on this device.",
  success: "Application sent",

  leaveTitle: "Leave this page?",
  leaveBody: "Your files stay saved on this device.",
  leaveUnsavedBody: "The files you picked can't be saved on this device, so you'll need to pick them again.",
  leaveConfirm: "Leave",
  stay: "Stay",
  stopSending: "Stop sending",
  keepSending: "Keep sending",
  leaveSendingTitle: "Stop sending?",
  leaveSendingBody: "Your application won't be submitted.",

  networkError: "Couldn't send your application. Your files are still here, so try again.",
  tooLarge: "Your files are too large to send together. Try smaller scans or PDFs.",

  pendingText: (date: string) => `You applied on ${date}. We'll let you know in your inbox once it's decided.`,
  pendingNext: "An admin checks each document. If something's missing they'll tell you why, and you can apply again.",
  sentTitle: "What you sent",
  reapplyNote: "If you apply again you'll need to upload all three documents again.",
};
