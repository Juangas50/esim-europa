"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";

interface FlagEmojiProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 14, height: 10 },
  md: { width: 18, height: 13 },
  lg: { width: 24, height: 18 },
};

export default function FlagEmoji({ emoji, size = "md", className = "" }: FlagEmojiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = sizeMap[size];

  useEffect(() => {
    if (containerRef.current) {
      twemoji.parse(containerRef.current, {
        folder: "svg",
        ext: ".svg",
        base: "https://cdn.jsdelivr.net/npm/twemoji@14/assets/",
      });

      // Force size on the SVG
      const svg = containerRef.current.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", dimensions.width.toString());
        svg.setAttribute("height", dimensions.height.toString());
        svg.style.width = `${dimensions.width}px`;
        svg.style.height = `${dimensions.height}px`;
        svg.style.display = "inline-block";
        svg.style.verticalAlign = "middle";
      }
    }
  }, [emoji, size, dimensions.width, dimensions.height]);

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        lineHeight: "0",
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {emoji}
    </div>
  );
}
