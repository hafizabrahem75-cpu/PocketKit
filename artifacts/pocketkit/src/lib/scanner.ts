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
