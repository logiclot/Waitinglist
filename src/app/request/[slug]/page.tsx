"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { solutions } from "@/data/mock";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function RequestPage({ params }: PageProps) {
  const solution = solutions.find((s) => s.slug === params.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!solution) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert("Request submitted! In a real app, this would redirect to Stripe.");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-secondary/10 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href={`/solutions/${solution.slug}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Solution
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold mb-6">Request Implementation</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                    <input
                      id="company"
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Work Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Describe your use case</label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Briefly describe your current process and what you hope to achieve..."
                  />
                </div>

                <div className="bg-secondary/20 p-4 rounded-lg text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                    Your payment is held in escrow until the expert accepts the project. You will be redirected to Stripe for secure payment.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : `Pay Deposit ($${solution.implementation_price.toLocaleString()})`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="h-16 w-16 bg-secondary rounded-md shrink-0" />
                <div>
                  <h4 className="font-medium text-sm line-clamp-2">{solution.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{solution.delivery_days} days delivery</p>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Implementation Fee</span>
                  <span className="font-medium">${solution.implementation_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total Due</span>
                  <span>${solution.implementation_price.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Verified Expert Implementation</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Secure Payment Protection</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
