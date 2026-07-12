"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";

interface FlagEmojiProps {
  emoji: string; // Flag emoji like 🇪🇸
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-3",
  md: "w-6 h-4.5",
  lg: "w-8 h-6",
};

export default function FlagEmoji({ emoji, size = "md", className = "" }: FlagEmojiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      twemoji.parse(containerRef.current, {
        folder: "svg",
        ext: ".svg",
        base: "https://cdn.jsdelivr.net/npm/twemoji@14/assets/",
      });
    }
  }, [emoji]);

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
      style={{ lineHeight: 0 }}
    >
      {emoji}
    </div>
  );
}
