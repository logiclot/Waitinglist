"use client";

import { clsx } from "clsx";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizes[size];

  return (
    <div
      className={clsx(
        "rounded-full shrink-0 overflow-hidden flex items-center justify-center font-semibold bg-primary/10 text-primary border border-border relative",
        sizeClass,
        className
      )}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
