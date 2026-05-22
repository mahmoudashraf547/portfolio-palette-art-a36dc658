// Supabase Storage service
// Uploads files to Supabase bucket and returns permanent public URLs
// No credit card or external configuration needed

import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase credentials not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to environment."
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Upload file to Supabase Storage
 * Ensures immediate visibility of new/updated files
 */
export async function uploadToSupabase(
  fileId: string,
  blob: Blob,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    const client = getSupabaseClient();
    const bucketName = "portfolio-files";
    
    // Create unique key with timestamp for cache busting
    const timestamp = Date.now();
    const key = `${fileId}/${timestamp}-${fileName}`;

    // Convert blob to File
    const file = new File([blob], fileName, { type: blob.type });

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(key, file, { upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      key: data.path,
    };
  } catch (error) {
    console.error("Supabase upload failed:", error);
    throw new Error(`Failed to upload file to Supabase: ${(error as Error).message}`);
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(key: string): Promise<void> {
  try {
    const client = getSupabaseClient();
    const bucketName = "portfolio-files";

    const { error } = await client.storage
      .from(bucketName)
      .remove([key]);

    if (error) throw error;
  } catch (error) {
    console.error("Supabase delete failed:", error);
    throw new Error(`Failed to delete file from Supabase: ${(error as Error).message}`);
  }
}

/**
 * For client-side code, call the API endpoint
 * Uploads file to Supabase via server endpoint
 */
export async function uploadToSupabaseViaApi(
  fileId: string,
  blob: Blob,
  fileName: string
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("fileId", fileId);
  formData.append("file", blob, fileName);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const result = await response.json();
  return result; // { url: "https://...", key: "..." }
}

/**
 * Delete file from Supabase via API endpoint
 */
export async function deleteFromSupabaseViaApi(key: string): Promise<void> {
  const response = await fetch("/api/storage/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}
