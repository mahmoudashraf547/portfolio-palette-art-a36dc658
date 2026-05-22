// Persistent file storage using JSON-based backend API
// Files are converted to base64 and saved to src/data/portfolio-data.json

export async function saveFilePersistent(id: string, blob: Blob, name: string): Promise<void> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const binary = String.fromCharCode(...bytes);
    const base64 = btoa(binary);

    const response = await fetch("/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name,
        kind: detectFileKind({ name } as any),
        data: base64,
        size: blob.size,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to save file");
    }
  } catch (e: any) {
    console.error("Error saving file:", e);
    throw e;
  }
}

export async function loadFilesPersistent(): Promise<
  Record<string, { name: string; kind: string; data: string; size: number }>
> {
  try {
    const response = await fetch("/api/files/load", { method: "GET" });
    if (!response.ok) throw new Error("Failed to load files");
    return await response.json();
  } catch (e) {
    console.error("Error loading files:", e);
    return {};
  }
}

export async function deleteFilePersistent(id: string): Promise<void> {
  try {
    const response = await fetch("/api/files/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Failed to delete file");
  } catch (e) {
    console.error("Error deleting file:", e);
    throw e;
  }
}

export function detectFileKind(file: { name: string }): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["ppt", "pptx"].includes(ext)) return "pptx";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  return "other";
}

export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}
