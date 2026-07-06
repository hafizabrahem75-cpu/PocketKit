import { Bell, Moon, Lock, Smartphone, Globe, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-lg">Manage your toolkit preferences.</p>
      </header>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Appearance</h3>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Always use dark theme</div>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            <Separator className="bg-border" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Smartphone className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="font-medium">Compact Layout</div>
                  <div className="text-sm text-muted-foreground">Reduce spacing between tools</div>
                </div>
              </div>
              <Switch disabled />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">General</h3>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-muted-foreground">Allow tool alerts</div>
                </div>
              </div>
              <Switch disabled />
            </div>
            <Separator className="bg-border" />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">Sync</div>
                  <div className="text-sm text-muted-foreground">Keep tools synced across devices</div>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Privacy</h3>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium">App Lock</div>
                  <div className="text-sm text-muted-foreground">Require authentication to open</div>
                </div>
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="font-medium">Data & Privacy</div>
                  <div className="text-sm text-muted-foreground">Manage your tool data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
