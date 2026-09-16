import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const MATERIAL_LABELS = {
  cables: "Copper cables",
  batteries: "Batteries",
  pcb: "Circuit boards (PCB)",
  panels: "LCD / CRT panels",
  motors: "Motors & magnets",
  plastics: "Mixed e-plastics",
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
