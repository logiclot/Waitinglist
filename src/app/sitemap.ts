import type { MetadataRoute } from "next";
import { CATEGORY_DEFINITIONS } from "@/lib/categories";
import { getAllDocSlugs } from "@/lib/docs-content";
import { BRAND_DOMAIN } from "@/lib/branding";
import { prisma } from "@/lib/prisma";
import { USE_CASES } from "@/data/use-cases";
import { GLOSSARY_TERMS } from "@/data/glossary";
import { INTEGRATIONS } from "@/data/integrations";
import { HIRE_VS_AUTOMATE_ROLES } from "@/data/hire-vs-automate";
import { COMPARISONS } from "@/data/comparisons";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  /* ── Static pages ──────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/solutions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/audit`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/jobs/discovery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/jobs/new`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/for-businesses`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/for-experts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/experts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/stacks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  /* ── Category-filtered solution pages ──────────────── */
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_DEFINITIONS.map(
    (cat) => ({
      url: `${BASE_URL}/solutions?category=${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  /* ── Documentation article pages ───────────────────── */
  const docPages: MetadataRoute.Sitemap = getAllDocSlugs().map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  /* ── Published solution pages ──────────────────────── */
  const publishedSolutions = await prisma.solution.findMany({
    where: {
      status: "published",
      OR: [
        { moderationStatus: "auto_approved" },
        { moderationStatus: "approved" },
      ],
    },
    select: { id: true, updatedAt: true },
  });

  const solutionPages: MetadataRoute.Sitemap = publishedSolutions.map((s) => ({
    url: `${BASE_URL}/solutions/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  /* ── Expert profile pages ──────────────────────────── */
  const approvedExperts = await prisma.specialistProfile.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });

  const expertPages: MetadataRoute.Sitemap = approvedExperts.map((e) => ({
    url: `${BASE_URL}/experts/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  /* ── Use case pages ──────────────────────────────── */
  const useCaseHub: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/use-cases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((uc) => ({
    url: `${BASE_URL}/use-cases/${uc.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /* ── Glossary pages ──────────────────────────────── */
  const glossaryHub: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/glossary`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const glossaryPages: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((t) => ({
    url: `${BASE_URL}/glossary/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /* ── Integration pages ─────────────────────────── */
  const integrationHub: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/integrations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const integrationPages: MetadataRoute.Sitemap = INTEGRATIONS.map((i) => ({
    url: `${BASE_URL}/integrations/${i.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /* ── Hire vs Automate pages ────────────────────── */
  const hireVsAutomateHub: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/tools/hire-vs-automate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const hireVsAutomatePages: MetadataRoute.Sitemap = HIRE_VS_AUTOMATE_ROLES.map(
    (r) => ({
      url: `${BASE_URL}/tools/hire-vs-automate/${r.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  /* ── Comparison pages ─────────────────────────── */
  const comparisonHub: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const comparisonPages: MetadataRoute.Sitemap = COMPARISONS.map((c) => ({
    url: `${BASE_URL}/compare/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...docPages,
    ...solutionPages,
    ...expertPages,
    ...useCaseHub,
    ...useCasePages,
    ...glossaryHub,
    ...glossaryPages,
    ...integrationHub,
    ...integrationPages,
    ...hireVsAutomateHub,
    ...hireVsAutomatePages,
    ...comparisonHub,
    ...comparisonPages,
  ];
}
