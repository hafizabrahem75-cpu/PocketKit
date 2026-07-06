import { useRef, useState } from "react";
import { ArrowLeftRight, Copy, Check, Loader2, ImageOff, Upload, Languages } from "lucide-react";
import { extractTextFromImage } from "@/lib/ocr";
import { translateText, TranslationError, type TranslateLang } from "@/lib/translate";

type Mode = "text" | "image";

export function Translator() {
  const [mode, setMode] = useState<Mode>("text");
  const [from, setFrom] = useState<TranslateLang>("en");
  const [sourceText, setSourceText] = useState("");
  const [resultText, setResultText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const to: TranslateLang = from === "en" ? "ar" : "en";

  function resetResult() {
    setResultText("");
    setCopied(false);
    setError(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setSourceText("");
    setImageUrl(null);
    resetResult();
  }

  function swapLanguages() {
    setFrom((current) => (current === "en" ? "ar" : "en"));
    resetResult();
  }

  async function runTranslate(text: string) {
    if (!text.trim()) {
      setError("There is no text to translate.");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setResultText("");
    setCopied(false);

    try {
      const translated = await translateText(text, from, to);
      setResultText(translated);
    } catch (err) {
      setError(
        err instanceof TranslationError
          ? err.message
          : "Could not translate this text. Please try again.",
      );
    } finally {
      setIsTranslating(false);
    }
  }

  function handleTextTranslate() {
    runTranslate(sourceText);
  }

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError(null);
    setSourceText("");
    resetResult();
    setProgress(0);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsExtracting(true);

    try {
      const text = await extractTextFromImage(file, setProgress);
      setSourceText(text);
      setIsExtracting(false);

      if (text) {
        await runTranslate(text);
      } else {
        setError("No text was found in this image.");
      }
    } catch {
      setIsExtracting(false);
      setError("Could not extract text from this image.");
    }
  }

  function handleCopy() {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isBusy = isTranslating || isExtracting;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Translator</h2>
        <p className="text-muted-foreground text-lg">Translate text or images between Arabic and English.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-6">
        <div className="inline-flex rounded-xl bg-card border border-border p-1 gap-1">
          <button
            onClick={() => switchMode("text")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => switchMode("image")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "image"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Image
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 rounded-2xl bg-card border border-border p-4">
          <span className="font-medium w-24 text-center">{from === "en" ? "English" : "Arabic"}</span>
          <button
            onClick={swapLanguages}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-all"
            aria-label="Swap languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <span className="font-medium w-24 text-center">{to === "en" ? "English" : "Arabic"}</span>
        </div>

        {mode === "text" ? (
          <div className="space-y-4">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={from === "en" ? "Type text in English..." : "اكتب نصًا بالعربية..."}
              rows={6}
              dir={from === "ar" ? "rtl" : "ltr"}
              className="w-full resize-none rounded-2xl bg-card border border-border p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
            <button
              onClick={handleTextTranslate}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              Translate
            </button>
          </div>
        ) : (
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
              <Upload className="w-8 h-8 text-primary" strokeWidth={1.5} />
              <span className="font-medium">Click to upload an image</span>
              <span className="text-sm text-muted-foreground">PNG, JPG, or WEBP</span>
            </button>

            {imageUrl && (
              <div className="rounded-2xl bg-card border border-border p-4 flex justify-center">
                <img src={imageUrl} alt="Uploaded" className="max-h-64 rounded-xl object-contain" />
              </div>
            )}

            {isExtracting && (
              <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-6 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Extracting text... {progress}%</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            <ImageOff className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {isTranslating && mode === "text" && (
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Translating...</span>
          </div>
        )}

        {!isBusy && resultText && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-card border border-border p-4">
              <textarea
                readOnly
                value={resultText}
                rows={6}
                dir={to === "ar" ? "rtl" : "ltr"}
                className="w-full resize-none bg-transparent text-base text-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy result"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
