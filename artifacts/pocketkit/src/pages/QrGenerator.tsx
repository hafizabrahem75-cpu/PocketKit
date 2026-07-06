import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Download,
  Upload,
  Camera,
  CameraOff,
  Copy,
  Check,
  Share2,
  Search,
  ExternalLink,
  ImageOff,
  QrCode,
} from "lucide-react";
import { CameraScanner, isLikelyUrl, normalizeUrl, scanImageFile } from "@/lib/scanner";

const CAMERA_ELEMENT_ID = "qr-camera-scanner";

type Mode = "generate" | "scan";

export function QrGenerator() {
  const [mode, setMode] = useState<Mode>("generate");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">QR & Barcode Scanner</h2>
        <p className="text-muted-foreground text-lg">Generate QR codes or scan any QR code and barcode.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-6">
        <div className="inline-flex rounded-xl bg-card border border-border p-1 gap-1">
          <button
            onClick={() => setMode("generate")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "generate" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setMode("scan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "scan" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Scan
          </button>
        </div>

        {mode === "generate" ? <GeneratePanel /> : <ScanPanel />}
      </div>
    </div>
  );
}

function GeneratePanel() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (text.trim().length === 0) {
      setQrDataUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#e5e5e5",
        light: "#00000000",
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not generate a QR code for this input.");
          setQrDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  function handleDownload() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qr-code.png";
    link.click();
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or a URL..."
        className="w-full rounded-2xl bg-card border border-border p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
      />

      <div className="rounded-2xl bg-card border border-border p-8 flex flex-col items-center justify-center gap-6 min-h-[22rem]">
        {qrDataUrl ? (
          <>
            <div className="rounded-xl bg-background border border-border p-4">
              <img src={qrDataUrl} alt="Generated QR code" className="w-64 h-64" />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Download image
            </button>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            {error ?? "Your QR code will appear here."}
          </p>
        )}
      </div>
    </div>
  );
}

type ScanMethod = "image" | "camera";

function ScanPanel() {
  const [method, setMethod] = useState<ScanMethod>("image");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<null | "copied" | "failed">(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraScannerRef = useRef<CameraScanner | null>(null);

  useEffect(() => {
    return () => {
      cameraScannerRef.current?.stop();
    };
  }, []);

  function resetResult() {
    setResult(null);
    setError(null);
    setCopied(false);
    setShareStatus(null);
  }

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    resetResult();
    setImagePreview(URL.createObjectURL(file));
    setIsScanningImage(true);

    try {
      const decoded = await scanImageFile(file);
      setResult(decoded);
    } catch {
      setError("No QR code or barcode was found in this image.");
    } finally {
      setIsScanningImage(false);
    }
  }

  async function handleStartCamera() {
    resetResult();
    setImagePreview(null);
    setIsCameraActive(true);

    try {
      if (!cameraScannerRef.current) {
        cameraScannerRef.current = new CameraScanner(CAMERA_ELEMENT_ID);
      }
      await cameraScannerRef.current.start(
        async (decoded) => {
          setResult(decoded);
          await cameraScannerRef.current?.stop();
          setIsCameraActive(false);
        },
        (message) => {
          setError(`Could not access the camera: ${message}`);
          setIsCameraActive(false);
        },
      );
    } catch {
      setIsCameraActive(false);
    }
  }

  async function handleStopCamera() {
    await cameraScannerRef.current?.stop();
    setIsCameraActive(false);
  }

  async function handleSwitchMethod(next: ScanMethod) {
    if (isCameraActive) {
      await handleStopCamera();
    }
    resetResult();
    setImagePreview(null);
    setMethod(next);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShare() {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: result });
      } catch {
        // user cancelled share, no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(result);
      setShareStatus("copied");
      setTimeout(() => setShareStatus(null), 2000);
    } catch {
      setShareStatus("failed");
      setTimeout(() => setShareStatus(null), 2000);
    }
  }

  function handleSearchGoogle() {
    if (!result) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(result)}`, "_blank", "noopener,noreferrer");
  }

  function handleOpenLink() {
    if (!result) return;
    window.open(normalizeUrl(result), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-xl bg-card border border-border p-1 gap-1">
        <button
          onClick={() => handleSwitchMethod("image")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            method === "image" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <button
          onClick={() => handleSwitchMethod("camera")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            method === "camera" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="w-4 h-4" />
          Scan with Camera
        </button>
      </div>

      {method === "image" ? (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-dashed border-border p-10 hover:border-primary/50 hover:bg-card/80 transition-all"
          >
            <QrCode className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <span className="font-medium">Click to choose an image from your gallery</span>
            <span className="text-sm text-muted-foreground">PNG, JPG, or WEBP</span>
          </button>

          {imagePreview && (
            <div className="rounded-2xl bg-card border border-border p-4 flex justify-center">
              <img src={imagePreview} alt="Selected" className="max-h-64 rounded-xl object-contain" />
            </div>
          )}

          {isScanningImage && (
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-6 text-muted-foreground">
              <span>Scanning image...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-4 overflow-hidden">
            <div
              id={CAMERA_ELEMENT_ID}
              className={`w-full rounded-xl overflow-hidden ${isCameraActive ? "min-h-[18rem]" : "min-h-0"}`}
            />
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                <Camera className="w-8 h-8" strokeWidth={1.5} />
                <span>Tap start to scan with your camera in real time.</span>
              </div>
            )}
          </div>
          <button
            onClick={isCameraActive ? handleStopCamera : handleStartCamera}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
          >
            {isCameraActive ? (
              <>
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Start Camera
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          <ImageOff className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-2xl bg-card border border-border p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scan result</div>
          <div className="rounded-xl bg-background border border-border p-4 break-all text-base text-foreground">
            {result}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border font-medium text-sm hover:bg-card active:scale-95 transition-all"
            >
              {shareStatus === "copied" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shareStatus === "copied" ? "Copied link" : shareStatus === "failed" ? "Could not share" : "Share"}
            </button>
            <button
              onClick={handleSearchGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border font-medium text-sm hover:bg-card active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
              Search on Google
            </button>
            {isLikelyUrl(result) && (
              <button
                onClick={handleOpenLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border font-medium text-sm hover:bg-card active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
