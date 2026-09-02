"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RatingStars({
  value,
  onChange,
  label = "Choose a star rating",
  size = "large",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "small" | "large";
}) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= value;
        return (
          <Button
            key={star}
            type="button"
            variant="ghost"
            size="icon"
            className={`${size === "large" ? "size-12" : "size-9"} rounded-xl hover:bg-[#fff2b8]`}
            onClick={() => onChange(star)}
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
          >
            <Star
              className={`${size === "large" ? "size-8" : "size-6"} transition-colors ${selected ? "fill-[#f5c542] text-[#c98e00]" : "fill-transparent text-[#9aa69f]"}`}
            />
          </Button>
        );
      })}
    </div>
  );
}
