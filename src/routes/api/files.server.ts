import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/data/portfolio-data.json");

interface FileData {
  version: number;
  files: Record<string, { name: string; kind: string; data: string; size: number }>;
}

let cache: FileData | null = null;

async function loadData(): Promise<FileData> {
  if (cache) return cache;
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    cache = JSON.parse(content);
    return cache;
  } catch {
    cache = { version: 1, files: {} };
    return cache;
  }
}

async function saveData(data: FileData): Promise<void> {
  cache = data;
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save portfolio data:", e);
    throw new Error("Failed to save file");
  }
}

export async function handleSaveFile(
  id: string,
  name: string,
  kind: string,
  data: string,
  size: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await loadData();
    current.files[id] = { name, kind, data, size };
    await saveData(current);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Save failed" };
  }
}

export async function handleLoadFiles(): Promise<Record<string, { name: string; kind: string; data: string; size: number }>> {
  const data = await loadData();
  return data.files;
}

export async function handleDeleteFile(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await loadData();
    delete current.files[id];
    await saveData(current);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Delete failed" };
  }
}
