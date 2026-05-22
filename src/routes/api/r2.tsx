import { uploadToR2, deleteFromR2 } from "@/lib/r2-storage";

export async function POST(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/r2/upload") {
    try {
      const formData = await request.formData();
      const fileId = formData.get("fileId") as string;
      const file = formData.get("file") as File;

      if (!fileId || !file) {
        return new Response(JSON.stringify({ error: "Missing fileId or file" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const { url: r2Url, key } = await uploadToR2(fileId, blob, file.name);

      // Create a blob URL for immediate preview
      const dataUrl = URL.createObjectURL(blob);

      return new Response(
        JSON.stringify({
          success: true,
          url: r2Url,
          dataUrl,
          key,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error("R2 upload error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Upload failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  if (url.pathname === "/api/r2/delete") {
    try {
      const body = await request.json() as { fileId: string };
      const { fileId } = body;

      if (!fileId) {
        return new Response(JSON.stringify({ error: "Missing fileId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Delete all files with this fileId prefix
      await deleteFromR2(`${fileId}/`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("R2 delete error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Delete failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
}
