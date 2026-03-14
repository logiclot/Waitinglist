"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, ClipboardCheck, Gift, Send } from "lucide-react";
import { getSurveyQuestions } from "@/lib/survey-questions";

export default function FeedbackPage() {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackError, setFeedbackError] = useState("");

  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, number | string>>({});
  const [surveyStatus, setSurveyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [surveyError, setSurveyError] = useState("");
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [couponRevealed, setCouponRevealed] = useState(false);
  const { data: sessionData } = useSession();
  const role = sessionData?.user?.role as string | undefined;
  const isExpert = role === "EXPERT";
  const questions = getSurveyQuestions(role);

  useEffect(() => {
    fetch("/api/feedback/survey/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.completed) setSurveyCompleted(true);
      })
      .catch(() => {});
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackStatus("loading");
    setFeedbackError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: feedbackText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackError(data.error || "Failed to submit");
        setFeedbackStatus("error");
        return;
      }
      setFeedbackStatus("success");
      setFeedbackText("");
    } catch {
      setFeedbackError("Failed to submit feedback");
      setFeedbackStatus("error");
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = questions.filter((q) => q.type === "scale" || q.type === "nps");
    for (const q of required) {
      const val = surveyAnswers[q.id];
      if (val === undefined || val === "" || (q.type === "scale" && (Number(val) < (q as { min: number }).min || Number(val) > (q as { max: number }).max)) || (q.type === "nps" && (Number(val) < 0 || Number(val) > 10))) {
        setSurveyError(`Please answer all required questions (${q.label})`);
        return;
      }
    }
    setSurveyStatus("loading");
    setSurveyError("");
    try {
      const res = await fetch("/api/feedback/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyAnswers),
      });
      const data = await res.json();
      if (!res.ok) {
        setSurveyError(data.error || "Failed to submit survey");
        setSurveyStatus("error");
        return;
      }
      setSurveyStatus("success");
      setSurveyCompleted(true);
      if (data.firstTime) {
        setCouponRevealed(true);
      }
    } catch {
      setSurveyError("Failed to submit survey");
      setSurveyStatus("error");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Feedback
        </h1>
        <p className="text-muted-foreground">
          Share your thoughts and help us improve. Complete the survey for a 5% {isExpert ? "commission discount" : "discount on your next purchase"}.
        </p>
      </div>

      {/* Free-text Feedback */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Send us your feedback</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Share anything on your mind — bug reports, feature ideas, or general feedback.
        </p>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="What could we do better? What do you love? Tell us anything..."
            className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={10000}
            disabled={feedbackStatus === "loading"}
          />
          {feedbackError && <p className="text-sm text-destructive">{feedbackError}</p>}
          {feedbackStatus === "success" && (
            <p className="text-sm text-green-600">Thank you! Your feedback has been submitted.</p>
          )}
          <button
            type="submit"
            disabled={!feedbackText.trim() || feedbackStatus === "loading"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {feedbackStatus === "loading" ? "Sending..." : "Send feedback"}
          </button>
        </form>
      </section>

      {/* Survey */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Quick survey — 5% {isExpert ? "commission discount" : "off your next purchase"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Answer our short survey about your experience. Complete it for the first time to receive a 5% {isExpert ? "commission discount on your next payout" : "coupon for your next purchase"}.
        </p>

        {surveyCompleted && couponRevealed ? (
          <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-6 text-center">
            <Gift className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Thank you!</h3>
            <p className="text-muted-foreground mb-4">
              Check your notifications for your 5% {isExpert ? "commission discount" : "coupon"}. {isExpert
                ? "Your next payout will have a reduced platform fee."
                : <>Use code <strong className="text-foreground">FEEDBACKS</strong> at checkout on your next purchase.</>}
            </p>
            <p className="text-sm text-muted-foreground">
              {isExpert ? "Applied automatically on your next milestone release." : "Valid for first-time orders."} We appreciate your feedback!
            </p>
          </div>
        ) : surveyCompleted ? (
          <p className="text-muted-foreground">You&apos;ve already completed the survey. Thank you for your feedback!</p>
        ) : (
          <form onSubmit={handleSurveySubmit} className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <label className="block font-medium text-sm">
                  {q.label}
                  {(q.type === "scale" || q.type === "nps") && <span className="text-destructive ml-1">*</span>}
                </label>
                {q.type === "scale" && (
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: (q as { max: number }).max - (q as { min: number }).min + 1 }, (_, i) => (q as { min: number }).min + i).map((n) => (
                      <label key={n} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          checked={surveyAnswers[q.id] === n}
                          onChange={() => setSurveyAnswers((prev) => ({ ...prev, [q.id]: n }))}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{n}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "nps" && (
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <label key={i} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          checked={surveyAnswers[q.id] === i}
                          onChange={() => setSurveyAnswers((prev) => ({ ...prev, [q.id]: i }))}
                          className="rounded border-border sr-only peer"
                        />
                        <span className="w-8 h-8 flex items-center justify-center rounded border border-border text-sm hover:border-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                          {i}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "text" && (
                  <textarea
                    value={(surveyAnswers[q.id] as string) || ""}
                    onChange={(e) => setSurveyAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={2}
                  />
                )}
              </div>
            ))}
            {surveyError && <p className="text-sm text-destructive">{surveyError}</p>}
            {surveyStatus === "success" && !couponRevealed && (
              <p className="text-sm text-green-600">Thank you for your feedback!</p>
            )}
            <button
              type="submit"
              disabled={surveyStatus === "loading"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {surveyStatus === "loading" ? "Submitting..." : "Submit survey"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
