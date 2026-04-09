import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const CACHE_KEY = "random-solutions";
const CACHE_TTL = 120; // seconds

const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;
const useRedis = !!(UPSTASH_URL && UPSTASH_TOKEN);

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redis;
}

interface CachedSolution {
  id: string;
  slug: string;
  title: string;
  shortSummary: string | null;
  category: string;
  implementationPriceCents: number;
  deliveryDays: number;
}

async function fetchRandomSolutions(): Promise<CachedSolution[]> {
  // Use raw SQL for true random ordering
  const solutions = await prisma.$queryRaw<CachedSolution[]>`
    SELECT id, slug, title, "shortSummary", category, "implementationPriceCents", "deliveryDays"
    FROM "Solution"
    WHERE status = 'published'
      AND "moderationStatus" IN ('auto_approved', 'approved')
    ORDER BY RANDOM()
    LIMIT 3
  `;
  return solutions;
}

export async function GET() {
  try {
    // Try cache first
    if (useRedis) {
      const cached = await getRedis().get<CachedSolution[]>(CACHE_KEY);
      if (cached) {
        return NextResponse.json(formatSolutions(cached));
      }
    }

    const solutions = await fetchRandomSolutions();

    // Cache the result
    if (useRedis) {
      await getRedis().set(CACHE_KEY, solutions, { ex: CACHE_TTL });
    }

    return NextResponse.json(formatSolutions(solutions));
  } catch (error) {
    console.error("Failed to fetch random solutions:", error);
    return NextResponse.json([], { status: 500 });
  }
}

function formatSolutions(solutions: CachedSolution[]) {
  return solutions.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.shortSummary || "",
    category: s.category,
    implementationPrice: s.implementationPriceCents / 100,
    deliveryDays: s.deliveryDays,
  }));
}
