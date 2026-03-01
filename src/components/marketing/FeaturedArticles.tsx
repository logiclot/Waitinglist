import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp, Users, Zap, BarChart2, Shield } from "lucide-react";

const FEATURED_ARTICLES = [
  {
    slug: "what-is-automation",
    title: "What is Automation?",
    description: "Learn what business automation is, how it started, and why it matters for modern companies.",
    icon: Zap,
  },
  {
    slug: "automation-roi",
    title: "How to Calculate Automation ROI",
    description: "A practical framework for calculating the return on investment from business automation.",
    icon: TrendingUp,
  },
  {
    slug: "when-to-hire-automation-expert",
    title: "Hire an Expert vs. DIY",
    description: "A practical framework for deciding when to DIY your automation vs. bring in a specialist.",
    icon: Users,
  },
  {
    slug: "sales-automation",
    title: "Sales Automation Guide",
    description: "How to automate your pipeline and give reps more time to sell.",
    icon: BarChart2,
  },
  {
    slug: "how-escrow-works",
    title: "How Escrow Protects You",
    description: "Payments are held securely until you approve the work. Here's how it works on LogicLot.",
    icon: Shield,
  },
  {
    slug: "automation-for-beginners",
    title: "Automation for Beginners",
    description: "A step-by-step intro to business automation for teams new to the space.",
    icon: BookOpen,
  },
];

export function FeaturedArticles() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
            Learn
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
            Guides to get you started
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Practical articles on automation strategy, ROI, and when to bring in an expert.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_ARTICLES.map(({ slug, title, description, icon: Icon }) => (
            <Link
              key={slug}
              href={`/docs/${slug}`}
              className="group flex gap-4 p-5 rounded-xl border border-border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View all guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
