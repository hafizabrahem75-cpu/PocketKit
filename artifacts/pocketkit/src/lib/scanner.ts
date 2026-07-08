import { Html5Qrcode } from "html5-qrcode";

export function isLikelyUrl(value: string): boolean {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function scanImageFile(file: File): Promise<string> {
  const containerId = `qr-file-scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const container = document.createElement("div");
  container.id = containerId;
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const scanner = new Html5Qrcode(containerId);
  try {
    const result = await scanner.scanFile(file, false);
    return result;
  } finally {
    try {
      await scanner.clear();
    } catch {
      // ignore cleanup errors
    }
    container.remove();
  }
}

export class CameraScanner {
  private scanner: Html5Qrcode;
  private running = false;

  constructor(elementId: string) {
    this.scanner = new Html5Qrcode(elementId);
  }

  async start(onDecoded: (text: string) => void, onError?: (message: string) => void) {
    if (this.running) return;
    this.running = true;
    await this.scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => onDecoded(decodedText),
      () => {
        // per-frame decode failures are expected while no code is in view
      },
    ).catch((err) => {
      this.running = false;
      onError?.(err instanceof Error ? err.message : String(err));
      throw err;
    });
  }

  async stop() {
    if (!this.running) return;
    this.running = false;
    try {
      await this.scanner.stop();
    } catch {
      // scanner may already be stopped
    }
    try {
      await this.scanner.clear();
    } catch {
      // ignore cleanup errors
    }
  }

  isRunning() {
    return this.running;
  }
}

// ─── Entity extraction ────────────────────────────────────────────────────────

export type ResultType = "url" | "phone" | "email" | "text";
export type ResultSource = "qr" | "barcode" | "ocr";

export interface ScanResult {
  id: string;
  type: ResultType;
  value: string;
  source: ResultSource;
  label: string;
}

export function detectType(value: string): ResultType {
  const v = value.trim();
  if (isLikelyUrl(v)) return "url";
  if (/^[\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v)) return "email";
  if (/^\+?[\d][\d\s\-().]{5,}[\d]$/.test(v)) return "phone";
  return "text";
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function labelFor(type: ResultType, source: ResultSource): string {
  if (source === "qr") return type === "url" ? "QR → Link" : type === "phone" ? "QR → Phone" : type === "email" ? "QR → Email" : "QR Code";
  if (source === "barcode") return "Barcode";
  if (type === "url") return "Link";
  if (type === "email") return "Email";
  if (type === "phone") return "Phone";
  return "Text";
}

export function makeResult(value: string, source: ResultSource): ScanResult {
  const type = detectType(value);
  return { id: uid(), type, value: value.trim(), source, label: labelFor(type, source) };
}

export function extractEntities(ocrText: string): ScanResult[] {
  const results: ScanResult[] = [];
  const seen = new Set<string>();

  function add(type: ResultType, value: string) {
    const key = `${type}:${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ id: uid(), type, value, source: "ocr", label: labelFor(type, "ocr") });
  }

  // URLs
  const urlRx = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  for (const m of ocrText.matchAll(urlRx)) {
    add("url", m[0].replace(/[.,;:)]+$/, ""));
  }

  // Emails
  const emailRx = /[\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
  for (const m of ocrText.matchAll(emailRx)) {
    add("email", m[0]);
  }

  // Phone numbers (7–15 digits, international or local)
  const phoneRx = /\+?[\d][\d\s\-().]{5,}[\d]/g;
  for (const m of ocrText.matchAll(phoneRx)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      add("phone", m[0].trim());
    }
  }

  return results;
}
