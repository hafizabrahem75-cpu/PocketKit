import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Globe,
  Share2,
  User,
  Info,
  Sparkles,
  Check,
  Phone,
  MessageSquare,
  MessageCircle,
  Copy,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n";

const APP_VERSION = "1.0.0";
const DEVELOPER_NAME = "Hafiz Al-Sarra";
const DEVELOPER_PHONE = "717245252";

function ContactSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function openLink(url: string) {
    window.open(url, "_blank", "noopener");
    onClose();
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(DEVELOPER_PHONE);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1200);
    } catch {
      onClose();
    }
  }

  const actions = [
    {
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      label: "WhatsApp",
      onClick: () => openLink(`https://wa.me/${DEVELOPER_PHONE}`),
    },
    {
      icon: <Phone className="w-5 h-5 text-blue-400" />,
      label: "Phone Call",
      onClick: () => openLink(`tel:${DEVELOPER_PHONE}`),
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-violet-400" />,
      label: "SMS",
      onClick: () => openLink(`sms:${DEVELOPER_PHONE}`),
    },
    {
      icon: copied ? (
        <Check className="w-5 h-5 text-emerald-400" />
      ) : (
        <Copy className="w-5 h-5 text-amber-400" />
      ),
      label: copied ? "Copied!" : "Copy Number",
      onClick: () => void copyNumber(),
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={[
        "fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        ref={overlayRef}
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div
        className={[
          "relative w-full max-w-lg mx-auto rounded-t-3xl bg-card border-t border-x border-border shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            <h3 className="text-lg font-bold">Contact Developer</h3>
            <p className="text-sm text-muted-foreground">{DEVELOPER_NAME}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-6 pt-2 space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-background hover:bg-background/80 border border-border hover:border-primary/30 active:scale-[0.98] transition-all text-left"
            >
              <div className="p-2.5 rounded-xl bg-card border border-border shrink-0">
                {action.icon}
              </div>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [shareStatus, setShareStatus] = useState<null | "copied" | "failed">(null);
  const [contactOpen, setContactOpen] = useState(false);

  const isDark = theme === "dark";
  const isArabic = lang === "ar";

  async function handleShare() {
    const shareData = {
      title: t("appName"),
      text: t("home.subtitle"),
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus(null), 2000);
    } catch {
      setShareStatus("failed");
      setTimeout(() => setShareStatus(null), 2000);
    }
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
        <header className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("settings.title")}</h2>
          <p className="text-muted-foreground text-lg">{t("settings.subtitle")}</p>
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("settings.appearance")}
            </h3>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    {isDark ? (
                      <Moon className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.darkMode")}</div>
                    <div className="text-sm text-muted-foreground">{t("settings.darkModeDesc")}</div>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
              <Separator className="bg-border" />
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.language")}</div>
                    <div className="text-sm text-muted-foreground">{t("settings.languageDesc")}</div>
                  </div>
                </div>
                <div className="inline-flex rounded-lg bg-background border border-border p-1 gap-1">
                  <button
                    onClick={() => setLang("en")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      !isArabic ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang("ar")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isArabic ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    عربي
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("settings.general")}
            </h3>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <Share2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.share")}</div>
                    <div className="text-sm text-muted-foreground">
                      {shareStatus === "copied"
                        ? t("settings.shareCopied")
                        : shareStatus === "failed"
                          ? t("settings.shareFailed")
                          : t("settings.shareDesc")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => void handleShare()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                  {shareStatus === "copied" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {t("settings.shareAction")}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("settings.developer")}
            </h3>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <User className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.developerName")}</div>
                    <div className="text-sm text-muted-foreground">{DEVELOPER_NAME}</div>
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <Phone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.contactMe")}</div>
                    <div className="text-sm text-muted-foreground">{t("settings.contactMeDesc")}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all shrink-0"
                >
                  <Phone className="w-4 h-4" />
                  {t("settings.contactMe")}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("settings.about")}
            </h3>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <Sparkles className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.aboutApp")}</div>
                    <div className="text-sm text-muted-foreground">{t("appName")}</div>
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <Info className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium">{t("settings.aboutVersion")}</div>
                    <div className="text-sm text-muted-foreground">{APP_VERSION}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
