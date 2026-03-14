"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center px-6 max-w-md">
          <div className="text-5xl mb-4">Something went wrong</div>
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
