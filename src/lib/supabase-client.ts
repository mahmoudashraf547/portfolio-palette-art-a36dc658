import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or SUPABASE_URL and SUPABASE_ANON_KEY in the deployed environment."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

function buildSupabasePublicUrl(bucket: string, path: string) {
  const baseUrl = (supabaseUrl || "").replace(/\/$/, "");
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

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

    const publicUrl = urlData.publicUrl || buildSupabasePublicUrl(bucket, data.path);

    return {
      url: publicUrl,
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

/**
 * Load public metadata for uploaded files.
 *
 * If Row Level Security (RLS) is enabled on `uploaded_files`, make sure
 * anonymous users are allowed to select rows from the table.
 * Example SQL:
 *
 * CREATE POLICY "Public read access" ON public.uploaded_files
 *   FOR SELECT
 *   USING (auth.role() = 'anon');
 */
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
