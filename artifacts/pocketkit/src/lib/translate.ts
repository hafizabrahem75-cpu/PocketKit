export type TranslateLang = "en" | "ar";

export async function translateText(
  text: string,
  from: TranslateLang,
  to: TranslateLang,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Translation request failed.");
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;

  if (!translated || typeof translated !== "string") {
    throw new Error("No translation returned.");
  }

  return translated;
}
