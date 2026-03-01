import { PlayCircle, CheckCircle2 } from "lucide-react";
import { getYouTubeEmbedUrl, normalizeYouTubeUrl } from "@/lib/video";
import { Solution } from "@/types";

interface DemoVideoSectionProps {
  solution: Solution;
}

export function DemoVideoSection({ solution }: DemoVideoSectionProps) {
  const videoStatus = solution.demoVideoStatus ?? solution.demo_video_status;
  const videoUrl = solution.demoVideoUrl ?? solution.demo_video_url;
  const videoResult = videoUrl ? normalizeYouTubeUrl(videoUrl) : null;
  const videoId = videoResult?.ok ? videoResult.videoId : null;

  if (videoStatus !== 'approved' || !videoId) {
    return null;
  }

  // Default bullets if we can't infer specifics (using the provided copy)
  const bullets = [
    "Input: Trigger event initiates workflow",
    "Process: AI logic analyzes and routes data",
    "Action: System updates automatically",
    "Output: Final result delivered to stakeholders"
  ];

  return (
    <section className="bg-secondary/5 rounded-xl border border-border p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <PlayCircle className="h-5 w-5 text-red-500" />
        <h2 className="text-xl font-bold">Verified Demo</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Video Player (3/5 width on large screens) */}
        <div className="lg:col-span-3">
          <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden shadow-sm border border-border/50">
            <iframe
              src={getYouTubeEmbedUrl(videoId)}
              title={`${solution.title} Demo Video`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right Column: Proof Card (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">See the automation in action</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Verified demo video showing the real workflow and final output — not a marketing mockup.
          </p>

          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">What you&apos;ll see</h4>
            <ul className="space-y-2">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
