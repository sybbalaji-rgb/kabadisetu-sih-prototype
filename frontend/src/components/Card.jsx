import React from "react";
import { cn } from "../utils";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#d5ded0] bg-white p-6 shadow-sm transition hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn("mb-4 border-b border-[#eef3eb] pb-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-lg font-black text-[#173d30]", className)}>{children}</h3>;
}

export function CardContent({ children, className }) {
  return <div className={cn("text-sm text-[#355342]", className)}>{children}</div>;
}
