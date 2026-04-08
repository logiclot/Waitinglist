export type VideoProvider = 'youtube' | 'loom';

export interface NormalizeVideoResult {
  ok: boolean;
  normalizedUrl?: string;
  videoId?: string;
  provider?: VideoProvider;
  error?: string;
}

export function normalizeYouTubeUrl(url: string): NormalizeVideoResult {
  if (!url) {
    return { ok: false, error: "URL is empty" };
  }

  let videoId = "";
  
  // Handle various YouTube URL formats
  // 1. youtube.com/watch?v=VIDEO_ID
  // 2. youtu.be/VIDEO_ID
  // 3. youtube.com/shorts/VIDEO_ID
  // 4. youtube.com/embed/VIDEO_ID
  
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    if (hostname.includes("youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/shorts/")[1];
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/embed/")[1];
      }
    } else if (hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.slice(1);
    }
  } catch {
    return { ok: false, error: "Invalid URL format" };
  }

  // Clean video ID (remove any trailing query params from pathname extractions)
  if (videoId && videoId.includes("?")) {
    videoId = videoId.split("?")[0];
  }
  if (videoId && videoId.includes("&")) {
    videoId = videoId.split("&")[0];
  }

  if (!videoId || videoId.length < 5) { // Basic length check
    return { ok: false, error: "Could not extract a valid YouTube Video ID" };
  }

  // Normalized URL is the standard watch URL
  const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return { ok: true, normalizedUrl, videoId, provider: 'youtube' };
}

export function normalizeLoomUrl(url: string): NormalizeVideoResult {
  if (!url) {
    return { ok: false, error: "URL is empty" };
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (!hostname.includes("loom.com")) {
      return { ok: false, error: "Not a Loom URL" };
    }

    // Loom URLs: loom.com/share/VIDEO_ID or loom.com/embed/VIDEO_ID
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    let videoId = "";

    if (pathParts.length >= 2 && (pathParts[0] === "share" || pathParts[0] === "embed")) {
      videoId = pathParts[1].split("?")[0];
    }

    if (!videoId || videoId.length < 5) {
      return { ok: false, error: "Could not extract a valid Loom Video ID" };
    }

    const normalizedUrl = `https://www.loom.com/share/${videoId}`;
    return { ok: true, normalizedUrl, videoId, provider: 'loom' };
  } catch {
    return { ok: false, error: "Invalid URL format" };
  }
}

export function normalizeVideoUrl(url: string): NormalizeVideoResult {
  const youtubeResult = normalizeYouTubeUrl(url);
  if (youtubeResult.ok) return youtubeResult;

  const loomResult = normalizeLoomUrl(url);
  if (loomResult.ok) return loomResult;

  return { ok: false, error: "Unsupported video URL. Please use a YouTube or Loom link." };
}

export function validateDemoVideoUrl(url: string): { ok: boolean; error?: string } {
  const result = normalizeVideoUrl(url);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export function getYouTubeEmbedUrl(videoId: string, startSeconds?: number): string {
  let url = `https://www.youtube.com/embed/${videoId}?rel=0`;
  if (startSeconds && startSeconds > 0) {
    url += `&start=${startSeconds}`;
  }
  return url;
}

export function getLoomEmbedUrl(videoId: string): string {
  return `https://www.loom.com/embed/${videoId}`;
}

export function getVideoEmbedUrl(videoId: string, provider: VideoProvider, startSeconds?: number): string {
  if (provider === 'loom') return getLoomEmbedUrl(videoId);
  return getYouTubeEmbedUrl(videoId, startSeconds);
}

export function getVideoWatchUrl(videoId: string, provider: VideoProvider): string {
  if (provider === 'loom') return `https://www.loom.com/share/${videoId}`;
  return `https://www.youtube.com/watch?v=${videoId}`;
}
