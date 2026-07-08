import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Copy,
  Share2,
  ExternalLink,
  Phone,
  Mail,
  BookOpen,
  Loader2,
  CheckCheck,
  ScanLine,
  X,
  RotateCcw,
  Link2,
  FileText,
  AtSign,
  QrCode,
} from "lucide-react";
import { extractTextFromImage } from "@/lib/ocr";
import {
  scanImageFile,
  CameraScanner,
  extractEntities,
  makeResult,
  type ScanResult,
} from "@/lib/scanner";

const NOTES_KEY = "pocketkit.notes";

function saveToNotes(text: string) {
  const existing = localStorage.getItem(NOTES_KEY) ?? "";
  const stamp = new Date().toLocaleString();
  const entry = `\n\n─── Scanner (${stamp}) ───\n${text}`;
  localStorage.setItem(NOTES_KEY, existing + entry);
}

// ─── Result type icons & colours ─────────────────────────────────────────────

function typeIcon(type: ScanResult["type"]) {
  switch (type) {
    case "url":   return <Link2 className="w-4 h-4" />;
    case "phone": return <Phone className="w-4 h-4" />;
    case "email": return <AtSign className="w-4 h-4" />;
    default:      return <FileText className="w-4 h-4" />;
  }
}

function typeBadge(type: ScanResult["type"]) {
  switch (type) {
    case "url":   return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "phone": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "email": return "bg-violet-500/15 text-violet-400 border-violet-500/30";
    default:      return "bg-primary/10 text-primary border-primary/20";
  }
}

// ─── Single result card ───────────────────────────────────────────────────────

function ResultCard({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ text: result.value }).catch(() => {});
    } else {
      await copy();
    }
  }

  function saveNote() {
    saveToNotes(result.value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const isUrl   = result.type === "url";
  const isPhone = result.type === "phone";
  const isEmail = result.type === "email";
  const isText  = result.type === "text";

  const phoneDigits = result.value.replace(/[^\d+]/g, "");

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 p-1.5 rounded-lg border ${typeBadge(result.type)} shrink-0`}>
          {typeIcon(result.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${typeBadge(result.type).split(" ")[1]}`}>
            {result.label}
          </p>
          <p className="text-sm leading-relaxed break-words line-clamp-6 text-foreground">
            {result.value}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-4">
        <ActionBtn
          onClick={() => void copy()}
          icon={copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          label={copied ? "Copied!" : "Copy"}
          active={copied}
        />

        {isUrl && (
          <ActionBtn
            onClick={() => window.open(result.value, "_blank", "noopener")}
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            label="Open"
          />
        )}

        {isPhone && (
          <>
            <ActionBtn
              onClick={() => window.open(`tel:${phoneDigits}`, "_self")}
              icon={<Phone className="w-3.5 h-3.5" />}
              label="Call"
            />
            <ActionBtn
              onClick={() => window.open(`sms:${phoneDigits}`, "_self")}
              icon={<Mail className="w-3.5 h-3.5" />}
              label="SMS"
            />
          </>
        )}

        {isEmail && (
          <ActionBtn
            onClick={() => window.open(`mailto:${result.value}`, "_self")}
            icon={<Mail className="w-3.5 h-3.5" />}
            label="Email"
          />
        )}

        <ActionBtn
          onClick={() => void share()}
          icon={<Share2 className="w-3.5 h-3.5" />}
          label="Share"
        />

        {(isText || isUrl || isEmail || isPhone) && (
          <ActionBtn
            onClick={saveNote}
            icon={saved ? <CheckCheck className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            label={saved ? "Saved!" : "Save to Notes"}
            active={saved}
          />
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  active = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95",
        active
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Camera view ──────────────────────────────────────────────────────────────

function CameraView({
  onResult,
}: {
  onResult: (results: ScanResult[]) => void;
}) {
  const scannerRef = useRef<CameraScanner | null>(null);
  const uid = useId().replace(/:/g, "");
  const viewId = `camera-view-${uid}`;
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let mounted = true;
    const scanner = new CameraScanner(viewId);
    scannerRef.current = scanner;

    scanner
      .start(
        (decoded) => {
          if (!mounted) return;
          void scanner.stop().then(() => {
            const r = makeResult(decoded, "qr");
            const extras = extractEntities(decoded).filter((e) => e.value !== r.value);
            onResult([r, ...extras]);
          });
        },
        (msg) => {
          if (!mounted) return;
          setError(msg.includes("Permission") || msg.includes("permission")
            ? "Camera access denied. Please allow camera permission and try again."
            : "Could not start camera. Try uploading an image instead.");
        },
      )
      .then(() => { if (mounted) setStarting(false); })
      .catch(() => { /* error already surfaced via onError */ });

    return () => {
      mounted = false;
      void scanner.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-6 text-center space-y-2">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black">
      {starting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Starting camera…</p>
        </div>
      )}
      <div id={viewId} className="w-full" />
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-primary animate-pulse" />
          Point camera at a QR code or barcode
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Mode = "camera" | "upload";
type ScanState = "idle" | "scanning" | "done" | "error";

export function UniversalScanner() {
  const [mode, setMode] = useState<Mode>("upload");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setResults([]);
    setScanState("idle");
    setErrorMsg(null);
    setOcrProgress(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (mode === "camera") setCameraKey((k) => k + 1);
  }

  const handleResults = useCallback((r: ScanResult[]) => {
    setResults(r);
    setScanState(r.length > 0 ? "done" : "error");
    if (r.length === 0) setErrorMsg("Nothing was detected in this scan.");
  }, []);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setScanState("scanning");
    setErrorMsg(null);
    setResults([]);
    setOcrProgress(0);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const combined: ScanResult[] = [];
    const seen = new Set<string>();

    function addUnique(r: ScanResult) {
      const k = `${r.type}:${r.value}`;
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(r);
      }
    }

    // Run QR/barcode scan + OCR in parallel
    const [qrResult, ocrText] = await Promise.allSettled([
      scanImageFile(file),
      extractTextFromImage(file, setOcrProgress),
    ]);

    // Process QR/barcode result
    if (qrResult.status === "fulfilled" && qrResult.value) {
      const r = makeResult(qrResult.value, "qr");
      addUnique(r);
      // Also extract sub-entities from QR content
      for (const e of extractEntities(qrResult.value)) {
        if (e.value !== r.value) addUnique(e);
      }
    }

    // Process OCR result
    if (ocrText.status === "fulfilled" && ocrText.value.trim()) {
      const text = ocrText.value.trim();
      // Extract typed entities first
      for (const e of extractEntities(text)) addUnique(e);
      // Add the full text block only if it's not already a single entity
      if (combined.length === 0 || text.length > 80) {
        addUnique({
          id: `text-${Date.now()}`,
          type: "text",
          value: text,
          source: "ocr",
          label: "Extracted Text",
        });
      }
    }

    if (combined.length === 0) {
      setScanState("error");
      setErrorMsg("Nothing was detected. Try a clearer image with text, QR code, or barcode.");
    } else {
      setResults(combined);
      setScanState("done");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  const isDone = scanState === "done";
  const isScanning = scanState === "scanning";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Universal Scanner</h2>
        <p className="text-muted-foreground text-lg">
          Scan QR codes, barcodes, text, links, phones, and emails.
        </p>
      </header>

      {/* Mode tabs */}
      {!isDone && !isScanning && (
        <div className="flex gap-1 p-1 rounded-xl bg-card border border-border w-fit">
          {(["upload", "camera"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={[
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                mode === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {m === "camera" ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {m === "camera" ? "Camera" : "Upload"}
            </button>
          ))}
        </div>
      )}

      {/* Camera mode */}
      {mode === "camera" && !isDone && (
        <CameraView key={cameraKey} onResult={handleResults} />
      )}

      {/* Upload mode */}
      {mode === "upload" && !isDone && !isScanning && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all py-12 px-6 flex flex-col items-center gap-4"
        >
          <div className="p-4 rounded-2xl bg-background border border-border">
            <QrCode className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold">Tap to upload an image</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP — scans QR codes, barcodes &amp; extracts text
            </p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Scanning progress */}
      {isScanning && (
        <div className="space-y-4">
          {previewUrl && (
            <div className="rounded-2xl overflow-hidden border border-border max-h-64">
              <img src={previewUrl} alt="Scanning" className="w-full h-64 object-contain bg-black" />
            </div>
          )}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
              <p className="font-medium text-sm">
                {ocrProgress > 0 ? `Extracting text… ${ocrProgress}%` : "Scanning image…"}
              </p>
            </div>
            {ocrProgress > 0 && (
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {scanState === "error" && errorMsg && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Results */}
      {isDone && results.length > 0 && (
        <div className="space-y-4">
          {/* Image preview strip */}
          {previewUrl && (
            <div className="rounded-2xl overflow-hidden border border-border max-h-48">
              <img src={previewUrl} alt="Scanned" className="w-full h-48 object-contain bg-black" />
            </div>
          )}

          {/* Result count + actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Scan again
            </button>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Camera scan again (after camera finds result) */}
      {isDone && mode === "camera" && (
        <button
          type="button"
          onClick={reset}
          className="w-full py-3.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Scan another code
        </button>
      )}

      {/* Dismiss error */}
      {scanState === "error" && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
