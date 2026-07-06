import { useState } from "react";

export function WordCounter() {
  const [text, setText] = useState("");

  const wordCount = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
  const characterCount = text.replace(/\s/g, "").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Word Counter</h2>
        <p className="text-muted-foreground text-lg">Count words and characters as you type.</p>
      </header>

      <div className="max-w-2xl mx-auto md:mx-0 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          rows={10}
          className="w-full resize-none rounded-2xl bg-card border border-border p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-semibold tracking-tight">{wordCount}</span>
            <span className="text-sm text-muted-foreground">Words</span>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-semibold tracking-tight">{characterCount}</span>
            <span className="text-sm text-muted-foreground">Characters (no spaces)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
