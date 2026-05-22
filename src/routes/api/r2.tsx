import { uploadToSupabase, deleteFromSupabase } from "@/lib/r2-storage";

// Cache-busting headers for instant visibility
const CACHE_CONTROL_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function POST(request: Request) {
  const url = new URL(request.url);

  // File upload endpoint
  if (url.pathname === "/api/storage/upload") {
    try {
      const formData = await request.formData();
      const fileId = formData.get("fileId") as string;
      const file = formData.get("file") as File;

      if (!fileId || !file) {
        return new Response(
          JSON.stringify({ error: "Missing fileId or file" }),
          {
            status: 400,
            headers: CACHE_CONTROL_HEADERS,
          }
        );
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "File too large (max 100MB)" }),
          {
            status: 400,
            headers: CACHE_CONTROL_HEADERS,
          }
        );
      }

      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const { url: supabaseUrl, key } = await uploadToSupabase(fileId, blob, file.name);

      // Return permanent Supabase URL for all users
      return new Response(
        JSON.stringify({
          success: true,
          url: supabaseUrl,
          key,
          message: "File uploaded successfully to Supabase Storage",
        }),
        {
          status: 200,
          headers: CACHE_CONTROL_HEADERS,
        }
      );
    } catch (error: any) {
      console.error("Supabase upload error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Upload failed" }),
        {
          status: 500,
          headers: CACHE_CONTROL_HEADERS,
        }
      );
    }
  }

  // File deletion endpoint
  if (url.pathname === "/api/storage/delete") {
    try {
      const body = await request.json() as { key: string };
      const { key } = body;

      if (!key) {
        return new Response(JSON.stringify({ error: "Missing key" }), {
          status: 400,
          headers: CACHE_CONTROL_HEADERS,
        });
      }

      await deleteFromSupabase(key);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: CACHE_CONTROL_HEADERS,
      });
    } catch (error: any) {
      console.error("Supabase delete error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Delete failed" }),
        {
          status: 500,
          headers: CACHE_CONTROL_HEADERS,
        }
      );
    }
  }

  // Keep R2 endpoints for backwards compatibility (will fail gracefully)
  if (url.pathname === "/api/r2/upload" || url.pathname === "/api/r2/delete") {
    return new Response(
      JSON.stringify({ error: "R2 endpoints deprecated. Use /api/storage/* instead." }),
      { status: 404, headers: CACHE_CONTROL_HEADERS }
    );
  }

  return new Response("Not Found", { status: 404 });
}
