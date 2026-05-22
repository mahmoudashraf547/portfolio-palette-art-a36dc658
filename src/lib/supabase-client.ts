import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export async function uploadFileToSupabase(
  fileId: string,
  blob: Blob,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    const bucket = "portfolio-files";
    const key = `${fileId}_${fileName}`;

    // Convert blob to file
    const file = new File([blob], fileName, { type: blob.type });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(key, file, { upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      key: data.path,
    };
  } catch (error: any) {
    console.error("Upload to Supabase failed:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

export async function deleteFileFromSupabase(key: string): Promise<void> {
  try {
    const bucket = "portfolio-files";
    const { error } = await supabase.storage.from(bucket).remove([key]);

    if (error) throw error;
  } catch (error: any) {
    console.error("Delete from Supabase failed:", error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function loadFilesFromSupabase(): Promise<
  Array<{ file_id: string; file_name: string; storage_url: string; file_kind: string; file_size: number }>
> {
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .select("file_id, file_name, storage_url, file_kind, file_size")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Failed to load files from Supabase:", error);
    return [];
  }
}
