import { useCallback, useRef, useState } from "react";
import {
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  FileImage,
  FilePlus2,
  Download,
  Loader2,
  GripVertical,
} from "lucide-react";
import jsPDF from "jspdf";

interface ImageEntry {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const addFiles = useCallback(async (files: File[]) => {
    setError(null);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const entries = await Promise.all(
      imageFiles.map(async (file) => {
        const { url, width, height } = await loadImage(file);
        return { id: `${Date.now()}-${Math.random()}`, file, url, width, height } satisfies ImageEntry;
      }),
    );
    setImages((prev) => [...prev, ...entries]);
  }, []);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    void addFiles(files);
    e.target.value = "";
  }

  function handleDropzoneDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    void addFiles(files);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const entry = prev.find((img) => img.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((img) => img.id !== id);
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverIndexRef.current = index;
  }

  function handleDragEnd() {
    const from = dragIndexRef.current;
    const to = dragOverIndexRef.current;
    if (from !== null && to !== null && from !== to) {
      setImages((prev) => {
        const arr = [...prev];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return arr;
      });
    }
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
  }

  async function generatePdf() {
    if (images.length === 0) return;
    setIsGenerating(true);
    setError(null);

    try {
      const first = images[0];
      const orientation = first.width >= first.height ? "landscape" : "portrait";

      const doc = new jsPDF({
        orientation,
        unit: "px",
        format: [first.width, first.height],
        hotfixes: ["px_scaling"],
      });

      for (let i = 0; i < images.length; i++) {
        const entry = images[i];

        if (i > 0) {
          const pageOrientation = entry.width >= entry.height ? "landscape" : "portrait";
          doc.addPage([entry.width, entry.height], pageOrientation);
        }

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = entry.width;
            canvas.height = entry.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas not available")); return; }
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            doc.addImage(dataUrl, "JPEG", 0, 0, entry.width, entry.height);
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to render image"));
          img.src = entry.url;
        });
      }

      doc.save("pocketkit-images.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Image to PDF</h2>
        <p className="text-muted-foreground text-lg">Combine images into a single PDF file — no upload needed.</p>
      </header>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDropzoneDrop}
        className={[
          "w-full rounded-2xl border-2 border-dashed transition-all duration-200 py-10 px-6 flex flex-col items-center gap-3 cursor-pointer",
          isDraggingOver
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80",
        ].join(" ")}
      >
        <div className="p-4 rounded-xl bg-background border border-border">
          <Upload className="w-7 h-7 text-primary" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-medium">Tap to add images</p>
          <p className="text-muted-foreground text-sm mt-0.5">PNG, JPG, WEBP, GIF — drag & drop or browse</p>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {images.length} {images.length === 1 ? "image" : "images"} — drag rows to reorder
            </p>
            <button
              type="button"
              onClick={() => {
                images.forEach((img) => URL.revokeObjectURL(img.url));
                setImages([]);
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="group flex items-center gap-3 rounded-xl bg-card border border-border p-3 transition-all hover:border-primary/40 cursor-grab active:cursor-grabbing active:opacity-70 active:scale-[0.99]"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                  <img
                    src={img.url}
                    alt={img.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{img.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {img.width} × {img.height}px · {(img.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="p-1.5 rounded-lg hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground text-sm flex items-center justify-center gap-2 transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            Add more images
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <button
          type="button"
          onClick={() => void generatePdf()}
          disabled={isGenerating}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF…
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF ({images.length} {images.length === 1 ? "page" : "pages"})
            </>
          )}
        </button>
      )}

      {images.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <FileImage className="w-10 h-10 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">No images added yet</p>
        </div>
      )}
    </div>
  );
}
