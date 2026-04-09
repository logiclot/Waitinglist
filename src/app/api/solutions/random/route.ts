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

async function fetchRandomSolutions() {
  const count = await prisma.solution.count({
    where: {
      status: "published",
      moderationStatus: { in: ["auto_approved", "approved"] },
    },
  });

  const skip = Math.max(0, Math.floor(Math.random() * (count - 3)));

  const solutions = await prisma.solution.findMany({
    where: {
      status: "published",
      moderationStatus: { in: ["auto_approved", "approved"] },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      shortSummary: true,
      category: true,
      implementationPriceCents: true,
      deliveryDays: true,
      expert: {
        select: {
          displayName: true,
          tier: true,
          user: {
            select: {
              profileImageUrl: true,
            },
          },
        },
      },
    },
    skip,
    take: 3,
  });

  return solutions;
}

type RandomSolution = Awaited<ReturnType<typeof fetchRandomSolutions>>[number];

export async function GET() {
  try {
    // Try cache first
    if (useRedis) {
      const cached = await getRedis().get<RandomSolution[]>(CACHE_KEY);
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

function formatSolutions(solutions: RandomSolution[]) {
  return solutions.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.shortSummary || "",
    category: s.category,
    implementationPrice: s.implementationPriceCents / 100,
    deliveryDays: s.deliveryDays,
    expert: {
      name: s.expert.displayName,
      profileImageUrl: s.expert.user.profileImageUrl,
      tier: s.expert.tier,
    },
  }));
}
