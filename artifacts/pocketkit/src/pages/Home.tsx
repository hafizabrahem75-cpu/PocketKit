import { 
  Calculator, 
  Clock, 
  ScanText, 
  FileText, 
  CheckSquare,
  Thermometer,
  Type,
  Timer
} from "lucide-react";
import { Link } from "wouter";

export function Home() {
  const placeholders = [
    { name: "Calculator", icon: Calculator, color: "text-blue-400", href: "/calculator" },
    { name: "Timer", icon: Timer, color: "text-orange-400" },
    { name: "Notes", icon: FileText, color: "text-emerald-400", href: "/notes" },
    { name: "Tasks", icon: CheckSquare, color: "text-violet-400", href: "/qr-generator" },
    { name: "Word Counter", icon: Type, color: "text-cyan-400", href: "/word-counter" },
    { name: "Image to Text", icon: ScanText, color: "text-rose-400", href: "/image-text-extractor" },
    { name: "Timezones", icon: Clock, color: "text-amber-400" },
    { name: "Units", icon: Thermometer, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your Toolkit</h2>
        <p className="text-muted-foreground text-lg">A calm space for your daily utilities.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {placeholders.map((tool, index) => {
          const Icon = tool.icon;
          const cardContent = (
            <>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`p-4 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-300 ${tool.color}`}>
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors">
                {tool.name}
              </span>
            </>
          );
          const className =
            "group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(139,92,246,0.3)] w-full";

          if (tool.href) {
            return (
              <Link key={index} href={tool.href} className={className}>
                {cardContent}
              </Link>
            );
          }

          return (
            <button key={index} className={className}>
              {cardContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
