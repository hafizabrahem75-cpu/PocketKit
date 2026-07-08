import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Copy,
  Search,
  Trash2,
  X,
  ClipboardX,
} from "lucide-react";

interface ClipItem {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "pocketkit.clipboard";
const MAX_ITEMS = 50;

function loadItems(): ClipItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClipItem[];
  } catch {
    return [];
  }
}

function saveItems(items: ClipItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ClipboardManager() {
  const [items, setItems] = useState<ClipItem[]>(loadItems);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pasted, setPasted] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setItems((prev) => {
      const alreadyExists = prev.find((i) => i.text === trimmed);
      if (alreadyExists) {
        return [
          { ...alreadyExists, createdAt: Date.now() },
          ...prev.filter((i) => i.id !== alreadyExists.id),
        ];
      }
      const next: ClipItem[] = [
        { id: `${Date.now()}-${Math.random()}`, text: trimmed, createdAt: Date.now() },
        ...prev,
      ];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  async function pasteFromClipboard() {
    setPasteError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setPasteError("Clipboard is empty.");
        return;
      }
      addItem(text);
      setPasted(true);
      setTimeout(() => setPasted(false), 1500);
    } catch {
      setPasteError("Could not read clipboard. Please allow clipboard access and try again.");
    }
  }

  async function copyItem(item: ClipItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // silent fail — clipboard write rarely fails
    }
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  const filtered = query.trim()
    ? items.filter((i) => i.text.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Clipboard</h2>
        <p className="text-muted-foreground text-lg">Save and revisit your clipboard history.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void pasteFromClipboard()}
          className={[
            "flex-1 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
            pasted
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          ].join(" ")}
        >
          {pasted ? (
            <>
              <ClipboardCheck className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Clipboard className="w-5 h-5" />
              Paste from Clipboard
            </>
          )}
        </button>
      </div>

      {pasteError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pasteError}
        </div>
      )}

      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history…"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {query ? ` matching "${query}"` : ""}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-3 rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm leading-relaxed break-words line-clamp-4">{item.text}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => void copyItem(item)}
                  className={[
                    "p-2 rounded-lg transition-all",
                    copiedId === item.id
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-background",
                  ].join(" ")}
                  aria-label="Copy"
                >
                  {copiedId === item.id ? (
                    <ClipboardCheck className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  aria-label="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <ClipboardX className="w-10 h-10 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">
            {query ? "No items match your search." : "No clipboard history yet. Paste something to start."}
          </p>
        </div>
      )}
    </div>
  );
}
