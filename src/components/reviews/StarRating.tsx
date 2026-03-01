"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizes = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({ value, onChange, size = "md", readonly = false }: StarRatingProps) {
  const sizeClass = sizes[size];

  return (
    <div className={`flex items-center gap-0.5 ${readonly ? "" : "cursor-pointer"}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${readonly ? "cursor-default" : "hover:scale-110 transition-transform"}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= value
                ? "text-amber-500 fill-amber-500"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
