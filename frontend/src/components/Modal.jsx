import React from "react";
import { X } from "lucide-react";
import { cn } from "../utils";

export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-[#d5ded0] bg-white p-6 shadow-2xl animate-in zoom-in-95",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3 mb-4">
          <h3 className="text-lg font-black text-[#173d30]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition"
          >
            <X className="size-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
