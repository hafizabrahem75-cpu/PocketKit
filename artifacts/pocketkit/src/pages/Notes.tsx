import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const STORAGE_KEY = "pocketkit.notes";

export function Notes() {
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? "";
    setText(stored);
    setSavedText(stored);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, text);
    setSavedText(text);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setText("");
    setSavedText("");
  }

  const isDirty = text !== savedText;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Notes</h2>
        <p className="text-muted-foreground text-lg">Jot something down. It stays right here.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note..."
          rows={12}
          className="w-full resize-none rounded-2xl bg-card border border-border p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {isDirty ? "Unsaved changes" : "Saved"}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
