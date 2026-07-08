import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const STORAGE_KEY = "pocketkit.lang";

const translations = {
  en: {
    "nav.home": "Home",
    "nav.settings": "Settings",
    "appName": "PocketKit",

    "home.title": "Your Toolkit",
    "home.subtitle": "A calm space for your daily utilities.",
    "tool.calculator": "Calculator",
    "tool.notes": "Notes",
    "tool.qrScanner": "QR & Barcode",
    "tool.wordCounter": "Word Counter",
    "tool.imageToText": "Image to Text",
    "tool.translator": "Translator",
    "tool.imageToPdf": "Image to PDF",
    "tool.clipboard": "Clipboard",

    "settings.title": "Settings",
    "settings.subtitle": "Manage your toolkit preferences.",
    "settings.appearance": "Appearance",
    "settings.darkMode": "Dark Mode",
    "settings.darkModeDesc": "Switch between dark and light theme",
    "settings.language": "Language",
    "settings.languageDesc": "Switch between English and Arabic",
    "settings.general": "General",
    "settings.share": "Share PocketKit",
    "settings.shareDesc": "Share this app with others",
    "settings.shareAction": "Share",
    "settings.shareCopied": "Link copied to clipboard",
    "settings.shareFailed": "Could not share right now",
    "settings.developer": "Developer",
    "settings.developerName": "Developer Name",
    "settings.contactMe": "Contact Me",
    "settings.contactMeDesc": "Get in touch with the developer",
    "settings.about": "About",
    "settings.aboutApp": "App Name",
    "settings.aboutVersion": "Version",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.settings": "الإعدادات",
    "appName": "بوكِت كِت",

    "home.title": "أدواتك",
    "home.subtitle": "مساحة هادئة لأدواتك اليومية.",
    "tool.calculator": "الآلة الحاسبة",
    "tool.notes": "الملاحظات",
    "tool.qrScanner": "الباركود ورمز QR",
    "tool.wordCounter": "عداد الكلمات",
    "tool.imageToText": "استخراج النص من الصورة",
    "tool.translator": "المترجم",
    "tool.imageToPdf": "صور إلى PDF",
    "tool.clipboard": "الحافظة",

    "settings.title": "الإعدادات",
    "settings.subtitle": "إدارة تفضيلات أدواتك.",
    "settings.appearance": "المظهر",
    "settings.darkMode": "الوضع الداكن",
    "settings.darkModeDesc": "التبديل بين الوضع الداكن والفاتح",
    "settings.language": "اللغة",
    "settings.languageDesc": "التبديل بين الإنجليزية والعربية",
    "settings.general": "عام",
    "settings.share": "مشاركة بوكِت كِت",
    "settings.shareDesc": "شارك هذا التطبيق مع الآخرين",
    "settings.shareAction": "مشاركة",
    "settings.shareCopied": "تم نسخ الرابط",
    "settings.shareFailed": "تعذرت المشاركة الآن",
    "settings.developer": "المطوّر",
    "settings.developerName": "اسم المطوّر",
    "settings.contactMe": "تواصل معي",
    "settings.contactMeDesc": "تواصل مع المطوّر",
    "settings.about": "حول التطبيق",
    "settings.aboutApp": "اسم التطبيق",
    "settings.aboutVersion": "الإصدار",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ar") return stored;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  function setLang(next: Lang) {
    setLangState(next);
  }

  function t(key: TranslationKey) {
    return translations[lang][key] ?? translations.en[key];
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
