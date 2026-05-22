import { handleSaveFile, handleLoadFiles, handleDeleteFile } from "./files.server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  
  if (url.pathname === "/api/files/save") {
    const body = await request.json() as { id: string; name: string; kind: string; data: string; size: number };
    const result = await handleSaveFile(body.id, body.name, body.kind, body.data, body.size);
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (url.pathname === "/api/files/delete") {
    const body = await request.json() as { id: string };
    const result = await handleDeleteFile(body.id);
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not Found", { status: 404 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/files/load") {
    const files = await handleLoadFiles();
    return new Response(JSON.stringify(files), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}
