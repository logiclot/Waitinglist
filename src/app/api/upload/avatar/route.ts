/**
 * Profile picture upload — stores in Supabase Storage bucket "avatars".
 * Setup: Create bucket "avatars" in Supabase Dashboard → Storage.
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

const BUCKET = "avatars";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "File storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid type. Use JPEG, PNG, or WebP." }, { status: 400 });
  }

  // Derive extension from validated MIME type, not user-supplied filename
  const MIME_TO_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = MIME_TO_EXT[file.type] || "jpg";
  const path = `${session.user.id}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    log.error("upload.avatar_failed", { error: error.message ?? String(error) });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }

  // Delete the previous avatar from the bucket (fire-and-forget)
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImageUrl: true },
    });
    if (user?.profileImageUrl) {
      const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
      const idx = user.profileImageUrl.indexOf(bucketPrefix);
      if (idx !== -1) {
        const oldPath = decodeURIComponent(
          user.profileImageUrl.substring(idx + bucketPrefix.length)
        );
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
    }
  } catch (e) {
    log.error("upload.old_avatar_cleanup_failed", { error: String(e) });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  await prisma.user.update({ where: { id: session.user.id }, data: { profileImageUrl: urlData.publicUrl } })
  return NextResponse.json({ url: urlData.publicUrl });
}
