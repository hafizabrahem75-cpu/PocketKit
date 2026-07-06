import { useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { Upload, Copy, Check, Loader2, ImageOff } from "lucide-react";

export function ImageTextExtractor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    setExtractedText("");
    setCopied(false);
    setProgress(0);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsProcessing(true);

    try {
      const worker = await createWorker(["eng", "ara"], 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      setExtractedText(data.text.trim());
      await worker.terminate();
    } catch {
      setError("Could not extract text from this image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCopy() {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Image Text Extractor</h2>
        <p className="text-muted-foreground text-lg">Pull text out of any image, right in your browser.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-4">
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
          <Upload className="w-8 h-8 text-primary" strokeWidth={1.5} />
          <span className="font-medium">Click to upload an image</span>
          <span className="text-sm text-muted-foreground">PNG, JPG, or WEBP</span>
        </button>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            <ImageOff className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="rounded-2xl bg-card border border-border p-4 flex justify-center">
            <img src={imageUrl} alt="Uploaded" className="max-h-64 rounded-xl object-contain" />
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Extracting text... {progress}%</span>
          </div>
        )}

        {!isProcessing && extractedText && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-card border border-border p-4">
              <textarea
                readOnly
                value={extractedText}
                rows={8}
                className="w-full resize-none bg-transparent text-base text-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        )}

        {!isProcessing && imageUrl && !extractedText && !error && (
          <p className="text-muted-foreground text-sm">No text was found in this image.</p>
        )}
      </div>
    </div>
  );
}
