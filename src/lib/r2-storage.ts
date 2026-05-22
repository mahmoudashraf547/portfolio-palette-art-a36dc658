// Cloudflare R2 storage service
// Uploads files to R2 bucket and returns permanent public URLs

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.R2_API_TOKEN_ID;
  const secretAccessKey = process.env.R2_API_TOKEN_SECRET;
  const accountId = process.env.R2_ACCOUNT_ID;

  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error(
      "R2 credentials not configured. Add R2_API_TOKEN_ID, R2_API_TOKEN_SECRET, and R2_ACCOUNT_ID to env."
    );
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

export async function uploadToR2(
  fileId: string,
  blob: Blob,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    const client = getS3Client();
    const bucketName = process.env.R2_BUCKET_NAME || "portfolio-files";
    const accountId = process.env.R2_ACCOUNT_ID;

    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const key = `${fileId}/${fileName}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: blob.type,
      })
    );

    // Generate public URL
    const url = `https://pub-${accountId}.r2.dev/${bucketName}/${key}`;

    return { url, key };
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw new Error(`Failed to upload file to R2: ${(error as Error).message}`);
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    const client = getS3Client();
    const bucketName = process.env.R2_BUCKET_NAME || "portfolio-files";

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error("R2 delete failed:", error);
    throw new Error(`Failed to delete file from R2: ${(error as Error).message}`);
  }
}

// For client-side code, call the API endpoint below
export async function uploadToR2ViaApi(
  fileId: string,
  blob: Blob,
  fileName: string
): Promise<{ url: string; dataUrl: string }> {
  const formData = new FormData();
  formData.append("fileId", fileId);
  formData.append("file", blob, fileName);

  const response = await fetch("/api/r2/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const result = await response.json();
  return result; // { url: "https://...", dataUrl: "blob:..." }
}

export async function deleteFromR2ViaApi(fileId: string): Promise<void> {
  const response = await fetch("/api/r2/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}
