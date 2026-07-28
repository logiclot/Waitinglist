import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp, Users, Zap, BarChart2, Shield } from "lucide-react";
import { GlowBorder } from "@/components/ui/glow-border";

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
    <section className="pt-14 md:pt-28">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-xs text-ash-500 font-medium uppercase tracking-widest bg-white inline-flex py-1.5 px-3 border border-ash-300 ring-2 ring-ash-100 rounded-lg">
            Learn
          </p>
          <h2 className="text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mt-6 md:text-4xl">
            Guides to get you started
          </h2>
          <p className="max-w-md text-balance mx-auto mt-2 md:text-lg md:mt-4">
            Practical articles on automation strategy, ROI, and when to bring in an expert.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10">
          {FEATURED_ARTICLES.map(({ slug, title, description, icon: Icon }) => (
            <Link
              href={`/docs/${slug}`}
              className="bg-white border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl p-6"
            >
              <div className="size-11 bg-ash-100 flex items-center justify-center border border-ash-300 ring-[3px] ring-ash-100 rounded-xl">
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-ash-800 font-noto font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-ash-500 mt-1">
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
