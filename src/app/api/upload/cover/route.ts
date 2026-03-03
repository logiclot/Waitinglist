/**
 * Portfolio cover image upload — stores in Supabase Storage bucket "covers".
 * Setup: Create bucket "covers" (public) in Supabase Dashboard → Storage.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

const BUCKET = "covers";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
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
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid type. Use JPEG, PNG, or WebP." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
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
    log.error("upload.cover_failed", { error: error.message ?? String(error) });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }

  // Delete the previous cover image from the bucket (fire-and-forget)
  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: { portfolioCoverImage: true },
    });
    if (profile?.portfolioCoverImage) {
      const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
      const idx = profile.portfolioCoverImage.indexOf(bucketPrefix);
      if (idx !== -1) {
        const oldPath = decodeURIComponent(
          profile.portfolioCoverImage.substring(idx + bucketPrefix.length)
        );
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
    }
  } catch (e) {
    log.error("upload.old_cover_cleanup_failed", { error: String(e) });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return NextResponse.json({ url: urlData.publicUrl });
}
