import { Link, useLocation } from "wouter";
import { LayoutGrid, Settings } from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: LayoutGrid },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 h-screen sticky top-0">
        <div className="mb-8 px-4">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            PocketKit
          </h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 lg:p-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-lg pb-safe p-2 z-50">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={`flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
