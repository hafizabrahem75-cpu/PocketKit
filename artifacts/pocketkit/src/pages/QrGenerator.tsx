import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

export function QrGenerator() {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">QR Generator</h2>
        <p className="text-muted-foreground text-lg">Turn any text or link into a QR code.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-4">
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
    </div>
  );
}
