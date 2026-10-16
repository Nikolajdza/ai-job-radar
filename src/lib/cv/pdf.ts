import { extractText, getDocumentProxy } from "unpdf";

export const MAX_CV_BYTES = 4 * 1024 * 1024;

export class CvFileError extends Error {
  readonly statusCode = 422;

  constructor(message: string) {
    super(message);
    this.name = "CvFileError";
  }
}

/** Extract plain text from a PDF upload (text-based PDFs only, no OCR). */
export async function extractPdfText(file: File): Promise<string> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new CvFileError("Upload a PDF file.");
  }
  if (file.size > MAX_CV_BYTES) {
    throw new CvFileError("PDF is larger than 4 MB.");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  let text: string;
  try {
    const pdf = await getDocumentProxy(buffer);
    const result = await extractText(pdf, { mergePages: true });
    text = result.text;
  } catch {
    throw new CvFileError("Could not read this PDF. Try exporting it again.");
  }

  const cleaned = text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < 40) {
    throw new CvFileError(
      "This PDF has almost no selectable text (likely a scanned image). Paste your CV text instead.",
    );
  }

  return cleaned.slice(0, 50_000);
}
