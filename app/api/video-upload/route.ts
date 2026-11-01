import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

// The browser uploads video straight to Vercel Blob (the file never passes through this server),
// so only the short-lived upload token is requested here, and only by the signed-in owner.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  if (body.type === "blob.generate-client-token" && !(await isAdmin())) {
    return Response.json({ error: "You are signed out. Sign in again to upload." }, { status: 401 });
  }
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
        maximumSizeInBytes: MAX_VIDEO_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {}, // nothing to do: the entry stores the file's URL
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
