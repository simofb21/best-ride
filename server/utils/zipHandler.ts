import AdmZip from "adm-zip";

export function extractFitFromUpload(buffer: Buffer, filename: string): Buffer {
  const isZip = filename.toLowerCase().endsWith(".zip");

  if (!isZip) {
    return buffer;
  }

  const zip = new AdmZip(buffer);
  const entries = zip.getEntries().filter((e) => !e.isDirectory);
  const fitEntries = entries.filter((e) =>
    e.entryName.toLowerCase().endsWith(".fit"),
  );

  if (fitEntries.length === 0) {
    throw createError({
      statusCode: 400,
      message: "The zip file does not contain any .fit file",
    });
  }

  if (entries.length > 1) {
    throw createError({
      statusCode: 400,
      message: "The zip file must contain only one .fit file, no other files",
    });
  }

  const extracted = fitEntries[0]!.getData();

  // Protezione zip bomb: il file estratto non può superare 25MB
  const MAX_EXTRACTED = 25 * 1024 * 1024;
  if (extracted.length > MAX_EXTRACTED) {
    throw createError({
      statusCode: 400,
      message:
        "The extracted .fit file is too large. Maximum allowed size is 25MB.",
    });
  }

  return extracted;
}
