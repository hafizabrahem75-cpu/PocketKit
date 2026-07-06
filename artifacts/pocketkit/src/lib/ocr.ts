import { createWorker } from "tesseract.js";

export async function extractTextFromImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const worker = await createWorker(["eng", "ara"], 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}
