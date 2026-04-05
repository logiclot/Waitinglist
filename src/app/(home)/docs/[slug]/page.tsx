import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDocBySlug, getAllDocSlugs } from "@/lib/docs-content";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};
  const url = `https://${BRAND_DOMAIN}/docs/${slug}`;
  return {
    title: `${doc.title} | ${BRAND_NAME}`,
    description: doc.description,
    keywords: doc.keywords.join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url,
      type: "article",
      siteName: BRAND_NAME,
      images: [{ url: `https://${BRAND_DOMAIN}/og.png`, width: 1200, height: 630, alt: doc.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [`https://${BRAND_DOMAIN}/og.png`],
    },
  };
}

function renderInlineText(text: string) {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const result: React.ReactNode[] = [];
  let lastIdx = 0;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    result.push(text.slice(lastIdx, match.index));
    result.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    lastIdx = match.index + match[0].length;
  }
  result.push(text.slice(lastIdx));
  return result;
}

function DocContent({ content }: { content: string }) {
  const parts: React.ReactNode[] = [];
  const lines = content.trim().split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      parts.push(
        <h2 key={i} className="mt-10 mb-4 text-xl font-bold text-foreground">
          {renderInlineText(line.slice(3))}
        </h2>
      );
      i++;
    } else if (line.startsWith("### ")) {
      parts.push(
        <h3 key={i} className="mt-6 mb-3 text-lg font-semibold text-foreground">
          {renderInlineText(line.slice(4))}
        </h3>
      );
      i++;
    } else if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      parts.push(
        <ul key={i} className="mb-4 list-disc pl-6 space-y-1 text-foreground/90">
          {listItems.map((item, j) => {
            const linkMatch = item.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              const before = item.slice(0, linkMatch.index);
              const after = item.slice((linkMatch.index ?? 0) + linkMatch[0].length);
              const href = linkMatch[2];
              const linkEl = href.startsWith("http") ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  {linkMatch[1]}
                </a>
              ) : (
                <Link href={href} className="text-primary underline hover:text-primary/80">
                  {linkMatch[1]}
                </Link>
              );
              return (<li key={j}>{before}{linkEl}{after}</li>);
            }
            return <li key={j}>{renderInlineText(item)}</li>;
          })}
        </ul>
      );
    } else if (line.trim()) {
      const paras: string[] = [];
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith("## ") && !lines[i].startsWith("### ") && !lines[i].startsWith("- ")) {
        paras.push(lines[i]);
        i++;
      }
      const text = paras.join("\n");
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const tokens: React.ReactNode[] = [];
      let lastIdx = 0;
      let match;
      while ((match = linkRegex.exec(text)) !== null) {
        tokens.push(text.slice(lastIdx, match.index));
        const href = match[2];
        tokens.push(
          href.startsWith("http") ? (
            <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
              {match[1]}
            </a>
          ) : (
            <Link key={match.index} href={href} className="text-primary underline hover:text-primary/80">
              {match[1]}
            </Link>
          )
        );
        lastIdx = match.index + match[0].length;
      }
      tokens.push(text.slice(lastIdx));
      const finalTokens = tokens.map((t, k) =>
        typeof t === "string" ? <span key={k}>{renderInlineText(t)}</span> : React.cloneElement(t as React.ReactElement, { key: k })
      );
      parts.push(
        <p key={i} className="mb-4 text-foreground/90 leading-relaxed">
          {finalTokens}
        </p>
      );
    } else {
      i++;
    }
  }
  return <div className="doc-content">{parts}</div>;
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

function ArticleSchema({ doc, slug }: { doc: { title: string; description: string; content: string; keywords: string[] }; slug: string }) {
  const url = `https://${BRAND_DOMAIN}/docs/${slug}`;
  const wordCount = doc.content.split(/\s+/).length;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    description: doc.description,
    url,
    wordCount,
    keywords: doc.keywords.join(", "),
    datePublished: "2025-01-15T00:00:00Z",
    dateModified: "2026-02-28T00:00:00Z",
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: `https://${BRAND_DOMAIN}`,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: `https://${BRAND_DOMAIN}`,
      logo: {
        "@type": "ImageObject",
        url: `https://${BRAND_DOMAIN}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: `https://${BRAND_DOMAIN}/og.png`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function BreadcrumbSchema({ title, slug }: { title: string; slug: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://${BRAND_DOMAIN}` },
      { "@type": "ListItem", position: 2, name: "Documentation", item: `https://${BRAND_DOMAIN}/docs` },
      { "@type": "ListItem", position: 3, name: title, item: `https://${BRAND_DOMAIN}/docs/${slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const related = doc.relatedSlugs
    ?.map((s) => getDocBySlug(s))
    .filter(Boolean) ?? [];

  return (
    <>
      <ArticleSchema doc={{ title: doc.title, description: doc.description, content: doc.content, keywords: doc.keywords }} slug={slug} />
      <BreadcrumbSchema title={doc.title} slug={slug} />
      {doc.faqs && doc.faqs.length > 0 && <FAQSchema faqs={doc.faqs} />}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All documentation
      </Link>

      <article>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {doc.title}
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          {estimateReadTime(doc.content)} min read
        </p>
        <p className="text-xs text-muted-foreground mt-2">By LogicLot Team · Last updated March 2026</p>
        <p className="text-lg text-muted-foreground mb-8 mt-4">{doc.description}</p>

        <DocContent content={doc.content} />
      </article>

      {doc.faqs && doc.faqs.length > 0 && (
        <div className="mt-14 pt-10 border-t border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {doc.faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-14 pt-10 border-t border-border">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Related
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r!.slug}
                href={`/docs/${r!.slug}`}
                className="group flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-card/50 transition-all"
              >
                <span className="font-medium text-foreground group-hover:text-primary">
                  {r!.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/solutions"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
        >
          Browse Solutions
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/jobs/discovery"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-all"
        >
          Get a Discovery Scan
        </Link>
      </div>
    </div>
    </>
  );
}
