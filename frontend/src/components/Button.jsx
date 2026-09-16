import React from "react";
import { cn } from "../utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-[#173d30] text-[#e9ff9d] hover:bg-[#225741] shadow-sm",
    secondary: "bg-[#eaf1e7] text-[#173d30] hover:bg-[#dce7d7]",
    outline: "border border-[#173d30] text-[#173d30] hover:bg-[#f0f5ee]",
    accent: "bg-[#e9ff9d] text-[#173d30] hover:bg-[#d8f578] shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
