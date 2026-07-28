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
    description: "Payments are held securely until you approve the work, see how it works.",
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
    <section className="pt-20 md:pt-40">
      <div className="container mx-auto px-4 max-w-7xl xl:px-8">
        <div className="text-center relative">
          <span className="text-[70px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-t from-25% from-transparent to-ash-300 flex justify-center absolute -top-[50px] inset-x-0 md:text-[100px] md:-top-[75px]">
            learn
          </span>
          <h2 className="text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight md:text-4xl">
            Guides to get you started
          </h2>
          <p className="max-w-2xl text-balance mx-auto mt-2 md:text-lg md:mt-4">
            Automating a bad process just generates mistakes faster. Here is how to approach strategy, measure real returns, and know when to hand the keys to a specialist.
          </p>
        </div>

        <div className="grid items-start gap-4 mt-10 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_ARTICLES.map(({ slug, title, description, icon: Icon }) => (
            <Link
              key={slug}
              href={`/docs/${slug}`}
              className="bg-ash-200 flex flex-col gap-1 p-1 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl transition-[background] hover:bg-ash-300"
            >
              <div className="bg-white flex gap-6 p-6 rounded-[20px]">
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
              </div>
              <div className=" flex items-center justify-between gap-2 py-2.5 px-6">
                <span className="text-sm font-semibold">Read full guide</span>
                <ArrowRight className="size-4 -rotate-45" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/docs"
            className="bg-ash-200 inline-flex py-2.5 px-5 rounded-full transition-[background] hover:bg-ash-300"
          >
            <span className="text-sm text-ash-800 font-bold font-noto tracking-tight">See all our guides</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
