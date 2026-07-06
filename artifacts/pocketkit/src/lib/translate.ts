export type TranslateLang = "en" | "ar";

export class TranslationError extends Error {}

const MAX_CHUNK_LENGTH = 450;

function splitIntoChunks(text: string): string[] {
  const sentences = text.split(/(?<=[.!?؟،\n])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > MAX_CHUNK_LENGTH && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  if (chunks.length === 0) return [text];

  return chunks.flatMap((chunk) => {
    if (chunk.length <= MAX_CHUNK_LENGTH) return [chunk];
    const pieces: string[] = [];
    for (let i = 0; i < chunk.length; i += MAX_CHUNK_LENGTH) {
      pieces.push(chunk.slice(i, i + MAX_CHUNK_LENGTH));
    }
    return pieces;
  });
}

async function translateChunk(
  text: string,
  from: TranslateLang,
  to: TranslateLang,
): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new TranslationError("No internet connection. Please check your network and try again.");
  }

  if (response.status === 429) {
    throw new TranslationError("Too many translation requests right now. Please wait a moment and try again.");
  }

  if (!response.ok) {
    throw new TranslationError(`Translation service error (status ${response.status}). Please try again.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new TranslationError("Received an invalid response from the translation service.");
  }

  const responseData = (data as { responseData?: { translatedText?: unknown } } | undefined)?.responseData;
  const translated = responseData?.translatedText;
  const responseStatus = (data as { responseStatus?: number } | undefined)?.responseStatus;

  if (typeof translated !== "string" || translated.length === 0) {
    throw new TranslationError("No translation was returned for this text.");
  }

  if (responseStatus && responseStatus !== 200) {
    throw new TranslationError("The translation service could not process this text.");
  }

  if (/MYMEMORY WARNING/i.test(translated)) {
    throw new TranslationError("Translation quota reached for now. Please try again later.");
  }

  return translated;
}

export async function translateText(
  text: string,
  from: TranslateLang,
  to: TranslateLang,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  if (from === to) return trimmed;

  const chunks = splitIntoChunks(trimmed);
  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) continue;
    const translated = await translateChunk(trimmedChunk, from, to);
    translatedChunks.push(translated);
  }

  if (translatedChunks.length === 0) {
    throw new TranslationError("No translation was returned for this text.");
  }

  return translatedChunks.join(" ");
}
