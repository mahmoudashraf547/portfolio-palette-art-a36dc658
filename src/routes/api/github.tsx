import { uploadToR2 } from "@/lib/r2-storage";

const GITHUB_API_BASE = "https://api.github.com";
const DEFAULT_BRANCH = process.env.GITHUB_BRANCH || "main";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing GitHub environment variable: ${name}`);
  }
  return value;
}

function encodeGithubPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function githubHeaders(): Record<string, string> {
  const token = requireEnv("GITHUB_API_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function toBase64(data: string | ArrayBuffer): Promise<string> {
  if (typeof data === "string") {
    return btoa(new TextEncoder().encode(data).reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
  }
  const bytes = new Uint8Array(data);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function getFileSha(path: string, branch: string) {
  const owner = requireEnv("GITHUB_REPO_OWNER");
  const repo = requireEnv("GITHUB_REPO_NAME");
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeGithubPath(path)}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: githubHeaders() });
  if (response.status === 404) return null;
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub read failed: ${response.status} ${errorBody}`);
  }
  const payload = await response.json();
  return payload.sha as string | null;
}

async function commitGitHubFile(path: string, content: string | ArrayBuffer, message: string, branch = DEFAULT_BRANCH) {
  const owner = requireEnv("GITHUB_REPO_OWNER");
  const repo = requireEnv("GITHUB_REPO_NAME");
  const sha = await getFileSha(path, branch);
  const body = {
    message,
    content: await toBase64(content),
    branch,
    committer: {
      name: "Cloudflare Sync",
      email: "noreply@cloudflare-sync.local",
    },
    ...(sha ? { sha } : {}),
  } as Record<string, unknown>;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeGithubPath(path)}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub write failed: ${response.status} ${errorBody}`);
  }

  return await response.json();
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const op = url.searchParams.get("op") || "";

  try {
    if (op === "upload-file") {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const fileId = (formData.get("fileId") as string) || crypto.randomUUID();

      if (!file) {
        return new Response(JSON.stringify({ error: "Missing file upload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const sanitized = sanitizeFileName(file.name);
      const repoPath = `public/assets/${fileId}-${sanitized}`;
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });

      const { url: r2Url, key } = await uploadToR2(fileId, blob, file.name);
      await commitGitHubFile(repoPath, arrayBuffer, `Cloudflare asset sync: ${file.name}`);

      return new Response(
        JSON.stringify({
          success: true,
          r2Url,
          repoPath,
          key,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (op === "save-state") {
      const payload = await request.json();
      const state = payload?.state;
      if (!state || typeof state !== "object") {
        return new Response(JSON.stringify({ error: "Missing state payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const content = JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString(),
      });
      const path = "public/portfolio-state.json";
      await commitGitHubFile(path, content, "Cloudflare state sync: portfolio-state.json");

      return new Response(JSON.stringify({ success: true, path }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unsupported operation" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("GitHub sync error:", error);
    return new Response(JSON.stringify({ error: error.message || "Sync failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
